# Download PlantVillage dataset first:
# https://www.kaggle.com/datasets/abdallahalidev/plantvillage-dataset
# Extract to: backend/ml/plantvillage/

import tensorflow as tf
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout
from tensorflow.keras.models import Model
from tensorflow.keras.preprocessing.image import ImageDataGenerator
import os

DATASET_PATH = "plantvillage dataset/color/"
IMG_SIZE     = (224, 224)
BATCH_SIZE   = 32
EPOCHS       = 10
NUM_CLASSES  = 38

# Data generators
train_gen = ImageDataGenerator(
    rescale=1./255,
    validation_split=0.2,
    rotation_range=40,
    width_shift_range=0.2,
    height_shift_range=0.2,
    shear_range=0.2,
    zoom_range=0.3,
    horizontal_flip=True,
    vertical_flip=True,
    brightness_range=[0.7, 1.3],  # handles lighting variation
    fill_mode='nearest'
)

if os.path.exists(DATASET_PATH):
    train_data = train_gen.flow_from_directory(
        DATASET_PATH, target_size=IMG_SIZE,
        batch_size=BATCH_SIZE, subset='training',
        class_mode='categorical'
    )

    val_data = train_gen.flow_from_directory(
        DATASET_PATH, target_size=IMG_SIZE,
        batch_size=BATCH_SIZE, subset='validation',
        class_mode='categorical'
    )

    # MobileNetV2 transfer learning
    base = MobileNetV2(weights='imagenet', include_top=False, input_shape=(224,224,3))
    base.trainable = False

    x = GlobalAveragePooling2D()(base.output)
    x = Dense(256, activation='relu')(x)
    x = Dropout(0.3)(x)
    out = Dense(NUM_CLASSES, activation='softmax')(x)

    model = Model(inputs=base.input, outputs=out)
    model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])

    checkpoint_path = "../models/plant_disease_model.h5"
    if os.path.exists(checkpoint_path):
        print(f"Loading existing weights from {checkpoint_path}...")
        model.load_weights(checkpoint_path)

    os.makedirs("../models", exist_ok=True)
    checkpoint = tf.keras.callbacks.ModelCheckpoint(
        checkpoint_path,
        save_best_only=True,
        monitor='val_accuracy',
        verbose=1
    )

    model.fit(train_data, validation_data=val_data, epochs=EPOCHS, callbacks=[checkpoint])

    print("✅ Model training complete and best version saved!")
else:
    print(f"Dataset path {DATASET_PATH} not found. Please download it first.")
