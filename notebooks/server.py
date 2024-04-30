import http.server
import socketserver
from http import HTTPStatus
import cgi
import numpy as np
import imageio.v2 as imageio
import tensorflow as tf
from urllib.parse import parse_qs, urlparse

# Load your model
model = tf.keras.models.load_model('new_model_4.h5')
class_labels = ['Normal', 'Cataract']

# Resizing the image input
from PIL import Image

def resize_image(image):
    target_size = (256, 256)  # Example target size
    image_resized = image.resize(target_size, Image.ANTIALIAS)
    return image_resized

# Example usage:
# input_image_path = "input_image.jpg"
# output_image_path = "resized_image.jpg"

# resized_image = resize_image(input_image_path, target_size)


class ServerHandler(http.server.SimpleHTTPRequestHandler):

    def do_POST(self):
        if self.path == '/upload':
            form = cgi.FieldStorage(
                fp=self.rfile,
                headers=self.headers,
                environ={'REQUEST_METHOD': 'POST',
                         'CONTENT_TYPE': self.headers['Content-Type'],
                         })

            # Check if the file was uploaded
            if 'file' in form:
                file_item = form['file']
                if file_item.filename:
                    
                    file_data = file_item.file.read()
                    image = imageio.imread(file_data)
                    print(image)
                    print(image.shape)
                    image = resize_image(image)
                    image_normalized = image / 255.0
                    image_batch = np.expand_dims(image_normalized, axis=0)

                    prediction = model.predict(image_batch)
                    predicted_class = class_labels[int(prediction > 0.5)]

                    self.send_response(HTTPStatus.OK)
                    self.send_header('Content-type', 'text/html')
                    self.end_headers()
                    response = f"""
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>Prediction Result</title>
                        <style>
                            body {{
                                font-family: Arial, sans-serif;
                                margin: 0;
                                padding: 0;
                                background-color: #021d20;
                            }}
                            .container {{
                                width: 80%;
                                margin: auto;
                                padding: 20px;
                                background-color: rgb(6, 44, 78);
                                border-radius: 5px;
                                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                            }}
                            h1 {{
                                color: white;
                                text-align: center;
                            }}
                            p{{
                                color: white;
                            }}
                            strong{{
                                color : white;
                            }}
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <h1>Prediction Result</h1>
                            <p>The predicted class/Disease is: <strong>{predicted_class}</strong></p>
                        </div>
                    </body>
                    </html>
                """
                    self.wfile.write(response.encode())
                else:
                    self.send_error(HTTPStatus.BAD_REQUEST, "File is missing")
            else:
                self.send_error(HTTPStatus.BAD_REQUEST, "File is missing")

    def do_GET(self):
        if self.path == '/':
            self.path = '/index.html'
        return http.server.SimpleHTTPRequestHandler.do_GET(self)

# Set up server
port = 8000
with socketserver.TCPServer(("", port), ServerHandler) as httpd:
    print(f"Serving at port {port}")
    httpd.serve_forever()
