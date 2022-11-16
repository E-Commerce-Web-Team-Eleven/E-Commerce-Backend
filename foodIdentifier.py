import sys
import os
import io
import tensorflow as tf
import numpy as np

from tensorflow import keras
from tensorflow.keras import layers
from tensorflow.keras.models import Sequential

#sys.stdout = io.TextIOWrapper(sys.stdout.detach(), encoding = 'utf-8')
#sys.stderr = io.TextIOWrapper(sys.stderr.detach(), encoding = 'utf-8')

def getName(filename):
    model = tf.keras.models.load_model("C:/myproject/food_server/cnn_model")
    test_path = "C:/myproject/food_server/uploads/"+filename

    img_height = 224
    img_width = 224

    img = keras.preprocessing.image.load_img(
        test_path, target_size=(img_height, img_width)
    )

    #class_names = ['감자', '김치', '대파']
    class_names = ['potato', 'kimchi','green_onion']

    img_array = keras.preprocessing.image.img_to_array(img)
    img_array = tf.expand_dims(img_array, 0) # Create a batch

    predictions = model.predict(img_array)
    score = tf.nn.softmax(predictions[0])

    #print("score is ",score)

    #print(
    #    "This image most likely belongs to {} with a {:.2f} percent confidence."
    #    .format(class_names[np.argmax(score)], 100 * np.max(score))
    #)

    print(class_names[np.argmax(score)])

if __name__ == '__main__':
    getName(sys.argv[1])