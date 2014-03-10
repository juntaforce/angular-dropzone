![Screenshot](http://i.imgur.com/3Ljo26J.png)

Brought to you by enyo<http://http://www.dropzonejs.com//>, a light weight JavaScript library that turns an HTML element into a dropzone.  Here I have brought you the same but modify
library as an Angular Js Directive.

![Screenshot](http://i.imgur.com/ZbeWmRR.png)
![Screenshot](http://i.imgur.com/3zZo3Dq.png)


## Main features

- Image thumbnail previews.
- Multiple files and synchronous uploads
- Progress updates
- Support for large files
- Only support for file data return, so you can send base64 through websocket
- Simulate upload while data being transfer through socket object.

## Working Progress
- Currently have directory file upload disabled.
- Use Angular.js $http.post() for file upload
- Use the url form element to upload with $http.post()

## Usage

Implicit creation:

```html
<form action="/upload" drop-zone  callbacks="callbacks" options="dropZoneOptions" class="dropzone"></form>
```

DropZone will automatically attach and handles the file drop, providing the necessary data.

Want more control? You can configure DropZone through the controller like this:

```js
//within your controller you can assign $scope.options variables to configure all defaultOptions, completely customizable
//assign the $scope variable to data attribute options within the html form

		$scope.dropZoneOptions =
		{
			maxFilesize:250,
			maxFiles:3
		};

//assign the $scope variable to data attribute callbacks within the html form to gather the file object information
		$scope.callbacks =
			{
				onFileUpload:function( file ) {
					//here you will receive the file data, while receiving the data the uploader simulation will
					//start and it will slowdown while the progress bar increases which it will never complete, unless
					//you $scope.$emit('dropZone:completed',file)

					exampleSocket.send({upload:file}).then(function(){

						//data received from socket
						if(true)
						$scope.$emit('dropZone:completed',file);
					})

				},
				removedFile:function(file){
					exampleSocket.send({remove:file})
				}

			}
```



> Note that this project is still in working progress and I like to thank enyo/dropzone, which provided a great foundation to start this directive.  I have modify the directive intensively for
angular support without the need of JQuery.  In addition if you would like to know more about WebSocket implementation contact me @reyramos@myphpdelights.com

## Browser support

- Chrome 7+
- IE 10+
- Still testing more browsers


License
-------
Copyright (c) 2014 reyramos@myphpdelights.com

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.