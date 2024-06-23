from flask import Flask, request, render_template, render_template_string
import os
from io import BytesIO
from PIL import Image
import numpy as np
import torch
import tensorflow as tf
from tensorflow.keras.preprocessing import image
import RRDBNet_arch as arch
import cv2

app = Flask(__name__)

# Load classification model
classification_model_path = 'D:/minip/minip/notebooks/ocular_disease_vgg16_2.h5'
classification_model = tf.keras.models.load_model(classification_model_path)
class_labels = ['cataract', 'diabetic_retinopathy', 'glaucoma', 'normal']

# Load ESRGAN model
esrgan_model_path = 'D:/minip/minip/notebooks/esrgan/RRDB_ESRGAN_x4.pth'
device = torch.device('cpu')  # Use CPU for ESRGAN
esrgan_model = arch.RRDBNet(3, 3, 64, 23, gc=32)
esrgan_model.load_state_dict(torch.load(esrgan_model_path), strict=True)
esrgan_model.eval()
esrgan_model = esrgan_model.to(device)

def preprocess_image(img_path):
    img = image.load_img(img_path, target_size=(224, 224))
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array /= 255.0  # Rescale the image
    return img_array

def super_resolve_image(img):
    img = np.array(img) * 1.0 / 255
    img = torch.from_numpy(np.transpose(img[:, :, [2, 1, 0]], (2, 0, 1))).float()
    img_LR = img.unsqueeze(0).to(device)

    with torch.no_grad():
        output = esrgan_model(img_LR).data.squeeze().float().cpu().clamp_(0, 1).numpy()
    output = np.transpose(output[[2, 1, 0], :, :], (1, 2, 0))
    output = (output * 255.0).round().astype(np.uint8)
    return Image.fromarray(output)

def is_fundus_image(img):
    gray = cv2.cvtColor(np.array(img), cv2.COLOR_BGR2GRAY)
    blurred = cv2.medianBlur(gray, 5)
    circles = cv2.HoughCircles(blurred, cv2.HOUGH_GRADIENT, 1, minDist=20,
                               param1=50, param2=30, minRadius=30, maxRadius=150)

    if circles is not None:
        return True
    return False

@app.route('/', methods=['GET', 'POST'])
def upload_file():
    if request.method == 'POST':
        file = request.files['file']
        if file:
            img = Image.open(BytesIO(file.read()))

            if is_fundus_image(img):
                enhanced_img = super_resolve_image(img)
                img_path = 'static/uploaded_image.png'
                enhanced_img.save(img_path)

                preprocessed_img = preprocess_image(img_path)
                prediction = classification_model.predict(preprocessed_img)
                predicted_class = class_labels[np.argmax(prediction)]

                # Render result HTML dynamically
                result_html = f"""
                    <html>
                    <head>
                        <title>Result</title>
                    </head>
                    <body>
                        <h1>Predicted Class: {predicted_class}</h1>
                        <img src="{img_path}" alt="Uploaded Image">
                    </body>
                    </html>
                """

                # Save the result HTML to a file
                with open('templates/result.html', 'w') as f:
                    f.write(result_html)

                return render_template('result.html')
            else:
                # Render result HTML for non-fundus image
                result_html = """
                    <html>
                    <head>
                        <title>Result</title>
                    </head>
                    <body>
                        <h1>Not a fundus image</h1>
                    </body>
                    </html>
                """

                # Save the result HTML to a file
                with open('templates/result.html', 'w') as f:
                    f.write(result_html)

                return render_template('result.html')
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)
