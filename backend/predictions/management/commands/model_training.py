# predictions/management/commands/model_training.py

import os
import tensorflow as tf
from django.core.management.base import BaseCommand

class Command(BaseCommand):
    help = "Train ResNet50, EfficientNetB0, and InceptionResNetV2 on movement-image data"

    def handle(self, *args, **options):
        # 1) Clear any leftover models/graphs
        tf.keras.backend.clear_session()

        # 2) Paths
        data_dir  = r'C:\Users\HP\Documents\EcoGuard Trials\movement data\images'
        train_dir = os.path.join(data_dir, 'train')

        # 3) Load datasets (RGB)
        train_ds = tf.keras.preprocessing.image_dataset_from_directory(
            train_dir,
            validation_split=0.2,
            subset='training',
            seed=123,
            image_size=(224, 224),
            batch_size=32,
            color_mode='rgb'
        )
        val_ds = tf.keras.preprocessing.image_dataset_from_directory(
            train_dir,
            validation_split=0.2,
            subset='validation',
            seed=123,
            image_size=(224, 224),
            batch_size=32,
            color_mode='rgb'
        )

        # 4) Normalize to [0,1]
        normalizer = tf.keras.layers.Rescaling(1./255)
        train_ds = train_ds.map(lambda x, y: (normalizer(x), y))
        val_ds   = val_ds.map(lambda x, y: (normalizer(x), y))

        # 5) Performance tweaks
        AUTOTUNE = tf.data.AUTOTUNE
        train_ds = train_ds.cache().shuffle(1000).prefetch(AUTOTUNE)
        val_ds   = val_ds.cache().prefetch(AUTOTUNE)

        # 6) Model factory
        def build_model(base_cls, name):
            base = base_cls(
                input_shape=(224, 224, 3),
                weights='imagenet',
                include_top=False
            )
            # freeze first 10 layers
            for layer in base.layers[:10]:
                layer.trainable = False

            x = tf.keras.layers.GlobalAveragePooling2D()(base.output)
            x = tf.keras.layers.Dense(512, activation='relu')(x)
            x = tf.keras.layers.Dropout(0.4)(x)
            out = tf.keras.layers.Dense(3, activation='softmax')(x)

            model = tf.keras.models.Model(inputs=base.inputs, outputs=out, name=name)
            model.compile(
                optimizer='adam',
                loss=tf.keras.losses.SparseCategoricalCrossentropy(),
                metrics=['accuracy']
            )
            return model

        # 7) Build each model
        model1 = build_model(tf.keras.applications.ResNet50,          'resnet50_ft')
        model2 = build_model(tf.keras.applications.EfficientNetB0,    'efficientnetb0_ft')
        model3 = build_model(tf.keras.applications.InceptionResNetV2, 'inceptionresnetv2_ft')

        # 8) Checkpoints
        ckpt1 = tf.keras.callbacks.ModelCheckpoint(
            'model1-{epoch:02d}-{val_accuracy:.4f}.keras',
            monitor='val_accuracy',
            mode='max',
            save_best_only=True,
            verbose=1
        )
        ckpt2 = tf.keras.callbacks.ModelCheckpoint(
            'model2-{epoch:02d}-{val_accuracy:.4f}.keras',
            monitor='val_accuracy',
            mode='max',
            save_best_only=True,
            verbose=1
        )
        ckpt3 = tf.keras.callbacks.ModelCheckpoint(
            'model3-{epoch:02d}-{val_accuracy:.4f}.keras',
            monitor='val_accuracy',
            mode='max',
            save_best_only=True,
            verbose=1
        )

        # 9) Train
        self.stdout.write(self.style.NOTICE("Training ResNet50…"))
        model1.fit(train_ds, validation_data=val_ds, epochs=20, callbacks=[ckpt1])

        self.stdout.write(self.style.NOTICE("Training EfficientNetB0…"))
        model2.fit(train_ds, validation_data=val_ds, epochs=20, callbacks=[ckpt2])

        self.stdout.write(self.style.NOTICE("Training InceptionResNetV2…"))
        model3.fit(train_ds, validation_data=val_ds, epochs=20, callbacks=[ckpt3])

        self.stdout.write(self.style.SUCCESS("All models trained and best checkpoints saved."))
