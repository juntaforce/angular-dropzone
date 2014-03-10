angular.module ( 'app' ).directive
	( 'dropZone',
	  [
		  '$window', '$timeout', '$q', '$rootScope',
		  function( $window, $timeout, $q, $rootScope ) {
			  var directive =
			  {
				  link:function( scope, element, attr ) {
					  var hiddenFileInput = document.getElementById ( 'hidden-drop-zone' ) || false;
					  var files = []
						  , noop = function() {}
						  , callbacks = {
							  confirm:function( status, accepted, rejected ) {

								  var question;
								  switch(status){
									  case STATUS.UPLOADING:
										  question = defaultOptions.dictCancelUploadConfirmation
										  break;
									  default:
										  question = defaultOptions.dictRemoveFileConfirmation
										  break;
								  }

								  if( window.confirm ( question ) ){
									  return accepted ();
								  }else if( rejected != null ){
									  return rejected ();
								  }
							  }
						  }
						  , STATUS = {
							  ADDED:"added", QUEUED:"queued", ACCEPTED:this.QUEUED, UPLOADING:"uploading", PROCESSING:this.UPLOADING, CANCELED:"canceled", ERROR:"error", SUCCESS:"success"
						  }
						  , defaultOptions = {
							  url:null,
							  method:"socket",
							  withCredentials:false,
							  parallelUploads:2,
							  uploadMultiple:false,
							  maxFilesize:250, //Mib
							  paramName:"file",
							  createImageThumbnails:true,
							  maxThumbnailFilesize:10,
							  thumbnailWidth:100,
							  thumbnailHeight:100,
							  maxFiles:3,
							  params:{},
							  clickable:true,
							  ignoreHiddenFiles:true,
							  acceptedFiles:null,
							  acceptedMimeTypes:null,
							  autoProcessQueue:true,
							  addRemoveLinks:true,
							  previewsContainer:null,
							  allowDirectoryUpload:false,
							  dictDefaultMessage:"Drop files here to upload",
							  dictFallbackMessage:"Your browser does not support drag'n'drop file uploads.",
							  dictFallbackText:"Please use the fallback form below to upload your files like in the olden days.",
							  dictFileTooBig:"File is too big ({{filesize}}MiB). Max filesize: {{maxFilesize}}MiB.",
							  dictInvalidFileType:"You can't upload files of this type.",
							  dictResponseError:"Server responded with {{statusCode}} code.",
							  dictCancelUpload:"Cancel upload",
							  dictCancelUploadConfirmation:"Are you sure you want to cancel this upload?",
							  dictRemoveFile:"Remove file",
							  dictRemoveFileConfirmation:null,
							  dictMaxFilesExceeded:"You can not upload any more files.",
							  previewTemplate:"<div class=\"dz-preview dz-file-preview\">\n  <div class=\"dz-details\">\n    <div class=\"dz-filename\"><span data-dz-name></span></div>\n    <div class=\"dz-size\" data-dz-size></div>\n    <img data-dz-thumbnail />\n  </div>\n  <div class=\"dz-progress\"><span class=\"dz-upload\" data-dz-uploadprogress></span></div>\n  <div class=\"dz-success-mark\"><i class=\"fa fa-check\"></i></div>\n  <div class=\"dz-error-mark\"><i class=\"fa fa-times\"></i></div>\n  <div class=\"dz-error-message\"><span data-dz-errormessage></span></div>\n</div>",
							  accept:function( file, done ) {
								  return done ();
							  },
							  resize:function( file ) {
								  var info, srcRatio, trgRatio;
								  info = {
									  srcX:0,
									  srcY:0,
									  srcWidth:file.width,
									  srcHeight:file.height
								  };
								  srcRatio = file.width / file.height;
								  trgRatio = defaultOptions.thumbnailWidth / defaultOptions.thumbnailHeight;
								  if( file.height < defaultOptions.thumbnailHeight || file.width < defaultOptions.thumbnailWidth )
								  {
									  info.trgHeight = info.srcHeight;
									  info.trgWidth = info.srcWidth;
								  }else
								  {
									  if( srcRatio > trgRatio )
									  {
										  info.srcHeight = file.height;
										  info.srcWidth = info.srcHeight * trgRatio;
									  }else
									  {
										  info.srcWidth = file.width;
										  info.srcHeight = info.srcWidth / trgRatio;
									  }
								  }
								  info.srcX = (file.width - info.srcWidth) / 2;
								  info.srcY = (file.height - info.srcHeight) / 2;
								  return info;
							  },
							  drop:function( e ) {
								  return element.removeClass ( "dz-drag-hover" );
							  },
							  dragstart:function( e ) {
							  },
							  dragend:function( e ) {
								  return element.removeClass ( "dz-drag-hover" );
							  },
							  dragenter:function( e ) {
								  return element.addClass ( "dz-drag-hover" );
							  },
							  dragover:function( e ) {
								  return  element.addClass ( "dz-drag-hover" );
							  },
							  dragleave:function( e ) {
								  return element.removeClass ( "dz-drag-hover" );
							  },
							  selectedfiles:function( files ) {
								  return element.addClass ( "dz-started" );
							  },
							  reset:function() {
								  if( !files.length )
								  {
									  return element.removeClass ( "dz-started" );
									  defaultOptions.dragleave(e)

								  }
							  },
							  addedfile:function( file ) {
								  var deferred = $q.defer ();
								  file.previewElement = createElement ( defaultOptions.previewTemplate );
								  file.previewTemplate = file.previewElement;
								  file.previewElement.querySelector ( "[data-dz-name]" ).textContent = file.name;
								  file.previewElement.querySelector ( "[data-dz-size]" ).innerHTML = getfilesize ( file.size );
								  //if set to true then add the removeLink
								  if( defaultOptions.addRemoveLinks )
								  {
									  file._removeLink = createElement ( "<a class=\"dz-remove\" href=\"javascript:undefined;\">" + defaultOptions.dictRemoveFile + "</a>" );
									  file._removeLink.addEventListener ( "click", function( e ) {
										  e.preventDefault ();
										  e.stopPropagation ();
										  //Delete or Cancel button

										  callbacks.confirm(STATUS.UPLOADING,function()
										  {
											  defaultOptions.removedfile ( file );
										  })

									  } );
									  file.previewElement.appendChild ( file._removeLink );
								  }
								  if( !_updateMaxFilesReachedClass () )
								  {
									  deferred.resolve ( file );
								  }
								  return deferred.promise;
							  },
							  removedfile:function( file ) {
								  var _ref;
								  if( (_ref = file.previewElement) != null )
								  {
									  _ref.parentNode.removeChild ( file.previewElement );

									  for(var i = 0; i < files.length; i++){
										  if(files[i].timeStamp == file.timeStamp){
											  files.splice(i,1)

										  }
									  }

									  cb('removedFile',file)
								  }

								  defaultOptions.reset ();
								  //								  return _updateMaxFilesReachedClass ();
							  },
							  thumbnail:function( file, dataUrl ) {
								  var thumbnailElement;
								  var previewElement = angular.element ( file.previewElement )
								  previewElement.removeClass ( "dz-file-preview" );
								  previewElement.addClass ( "dz-image-preview" );
								  thumbnailElement = file.previewElement.querySelector ( "[data-dz-thumbnail]" );
								  thumbnailElement.alt = file.name;
								  return thumbnailElement.src = dataUrl;
							  },
							  error:function( file, message ) {
								  //adds class for error 'X' and add message for error
								  file.previewElement.classList.add ( "dz-error" );
								  return file.previewElement.querySelector ( "[data-dz-errormessage]" ).textContent = message;
							  },
							  errormultiple:noop,
							  processing:function( file ) {
								  file.previewElement.classList.add ( "dz-processing" );
								  if( file._removeLink )
								  {
									  return file._removeLink.textContent = defaultOptions.dictCancelUpload;
								  }
							  },
							  processingmultiple:noop,
							  uploadprogress:function( file, progress ) {
								  return file.previewElement.querySelector ( "[data-dz-uploadprogress]" ).style.width = "" + progress + "%";
							  },
							  totaluploadprogress:noop,
							  sending:noop,
							  sendingmultiple:noop,
							  success:function( file ) {
								  $timeout ( function() {
									  return file.previewElement.classList.add ( "dz-success" );
								  }, 1, false );
							  },
							  successmultiple:noop,
							  canceled:function( file ) {
								  return this.emit ( "error", file, "Upload canceled." );
							  },
							  canceledmultiple:noop,
							  complete:function( file ) {
								  if( file._removeLink )
								  {
									  return file._removeLink.textContent = defaultOptions.dictRemoveFile;
								  }
							  },
							  completemultiple:noop,
							  maxfilesexceeded:noop
						  }
					  if( typeof(attr.options) != "undefined" && typeof(scope[ attr.options ]) != "undefined" )
					  {
						  var options = scope[ attr.options ]
						  Object.keys ( options ).forEach ( function( key ) {
							  defaultOptions[key] = options[key]
						  } );
					  }
					  if( typeof(attr.callbacks) != "undefined" && typeof(scope[ attr.callbacks ]) != "undefined" )
					  {
						  Object.keys ( scope[ attr.callbacks ] ).forEach ( function( key ) {
							  callbacks[key] = scope[ attr.callbacks ][key]
						  } );

					  }
					  var init = function() {
						  if( element[0].tagName === "FORM" )
						  {
							  element.attr ( "enctype", "multipart/form-data" );
						  }
						  if( element[0].classList.contains ( "dropzone" ) && !element[0].querySelector ( ".dz-message" ) )
						  {
							  element.append ( angular.element ( "<div class=\"dz-default dz-message\"><span>" + defaultOptions.dictDefaultMessage + "</span></div>" ) );
						  }
						  element.addClass ( "dz-clickable" );
						  setupHiddenFileInput ()
						  setupEventListeners ();
					  } ();

					  function _updateMaxFilesReachedClass () {

						  if( defaultOptions.maxFiles && getAcceptedFiles ().length >= defaultOptions.maxFiles )
						  {
							  element.addClass ( "dz-max-files-reached" );
							  return true;
						  }else
						  {
							  element.removeClass ( "dz-max-files-reached" );
							  return false
						  }


					  };
					  function getAcceptedFiles () {
						  var file, _i, _results;
						  _results = [];
						  for( _i = 0; _i < files.length; _i++ )
						  {
							  file = files[_i];
							  if( file.accepted )
							  {
								  _results.push ( file );
							  }
						  }
						  return _results;
					  };
					  //TODO: only do one hidden input no matter how many files
					  function setupHiddenFileInput () {
						  if( hiddenFileInput )
						  {
							  document.body.removeChild ( hiddenFileInput );
						  }
						  hiddenFileInput = document.createElement ( "input" );
						  hiddenFileInput.setAttribute ( "id", "hidden-drop-zone" );
						  hiddenFileInput.setAttribute ( "type", "file" );
						  hiddenFileInput.setAttribute ( "multiple", "multiple" );
						  if( defaultOptions.acceptedFiles != null )
						  {
							  hiddenFileInput.setAttribute ( "accept", defaultOptions.acceptedFiles );
						  }
						  hiddenFileInput.style.visibility = "hidden";
						  hiddenFileInput.style.position = "absolute";
						  hiddenFileInput.style.top = "0";
						  hiddenFileInput.style.left = "0";
						  hiddenFileInput.style.height = "0";
						  hiddenFileInput.style.width = "0";
						  document.body.appendChild ( hiddenFileInput );
						  hiddenFileInput.addEventListener ( "change", function() {
							  var files;
							  files = hiddenFileInput.files;
							  if( files.length )
							  {
								  defaultOptions.selectedfiles ( files )
								  handleFiles ( files );
							  }
							  //create a new one for every click
							  return setupHiddenFileInput ();
						  } );
					  };
					  function noPropagation ( event ) {
						  event.preventDefault ();
						  if( event && event.stopPropagation )
						  {
							  event.stopPropagation ();
						  }else
						  {
							  $window.event.cancelBubble = true;
						  }
					  };
					  function setupEventListeners () {
						  element.bind ( 'dragstart dragenter dragover dragleave drop dragend click', function( e ) {
							  switch( event.type )
							  {
								  case "dragstart":
									  break;
								  case "dragenter":
									  var efct;
									  try
									  {
										  efct = event.dataTransfer.effectAllowed;
									  }catch( _error )
									  {}
									  event.dataTransfer.dropEffect = 'move' === efct || 'linkMove' === efct ? 'move' : 'copy';
									  return defaultOptions.dragenter ( e );
									  break;
								  case "dragover":
									  noPropagation ( e );
									  return defaultOptions.dragover ( e );
									  break;
								  case "dragleave":
									  return defaultOptions.dragleave ( e );
									  break;
								  case "dragend":
									  return defaultOptions.dragend ( e );
									  break;
								  case "drop":
									  noPropagation ( e );
									  return drop ();
									  break;
								  case "click":
									  return hiddenFileInput.click ();
									  break;
							  }
						  } )
					  }

					  function drop () {
						  var files, items;
						  if( !event.dataTransfer )
						  {
							  return;
						  }
						  files = event.dataTransfer.files;
						  defaultOptions.selectedfiles ( files );
						  if( files.length )
						  {
							  items = event.dataTransfer.items;
							  if( items && items.length && ((items[0].webkitGetAsEntry != null) || (items[0].getAsEntry != null)) )
							  {
								  handleItems ( items );
							  }else
							  {
								  handleFiles ( files );
							  }
						  }
					  };
					  function handleItems ( items ) {
						  var entry, item, _i, _len;
						  for( _i = 0, _len = items.length; _i < _len; _i++ )
						  {
							  item = items[_i];
							  if( item.webkitGetAsEntry != null )
							  {
								  entry = item.webkitGetAsEntry ();
								  if( entry.isFile )
								  {
									  addFile ( item.getAsFile () );
								  }else if( entry.isDirectory && defaultOptions.allowDirectoryUpload )
								  {
									  addDirectory ( entry, entry.name );
								  }else
								  {
									  defaultOptions.dragleave ( e );
									  defaultOptions.reset ();
								  }
							  }else
							  {
								  addFile ( item.getAsFile () );
							  }
						  }
					  }

					  function addDirectory ( entry, path ) {
						  //Todo: allow directory upload
						  return;
						  var dirReader, entriesReader, _this = this;
						  dirReader = entry.createReader ();
						  entriesReader = function( entries ) {
							  var _i, _len;
							  for( _i = 0, _len = entries.length; _i < _len; _i++ )
							  {
								  entry = entries[_i];
								  if( entry.isFile )
								  {
									  entry.file ( function( file ) {
										  if( _this.options.ignoreHiddenFiles && file.name.substring ( 0, 1 ) === '.' )
										  {
											  return;
										  }
										  file.fullPath = "" + path + "/" + file.name;
										  return _this.addFile ( file );
									  } );
								  }else if( entry.isDirectory )
								  {
									  _this.addDirectory ( entry, "" + path + "/" + entry.name );
								  }
							  }
						  };
						  return dirReader.readEntries ( entriesReader, function( error ) {
							  return typeof console !== "undefined" && console !== null ? typeof console.log === "function" ? console.log ( error ) : void 0 : void 0;
						  } );
					  };
					  function handleFiles ( files ) {
						  var file, _results;
						  _results = [];
						  for( var i = 0; i < files.length; i++ )
						  {
							  file = files[i];
							  _results.push ( addFile ( file ) );
						  }
						  return _results;
					  };
					  function addFile ( file ) {
						  file.upload = {
							  progress:0,
							  total:file.size,
							  bytesSent:0
						  };

						  file.timeStamp = Math.round((new Date()).getTime() / 1000);
						  files.push ( file );
						  file.status = STATUS.ADDED;
						  defaultOptions.addedfile ( file ).then ( function( file ) {

							  //check if file size was not rejected
							  if( defaultOptions.createImageThumbnails && file.type.match ( /image.*/ ) && file.size <= defaultOptions.maxThumbnailFilesize * 1024 * 1024 )
							  {
								  getBase64Images ( file )
							  }
							  element.append ( file.previewElement );
							  return accept ( file, function( error ) {
								  if( error )
								  {
									  return _errorProcessing ( [ file ], error );
								  }else
								  {
									  return _enqueueFile ( file )
								  }
							  } );
						  } )
					  };
					  function uploadFiles ( files ) {
						  var file;
						  for( var i = 0; i < files.length; i++ )
						  {
							  file = files[i];
							  switch( defaultOptions.method )
							  {
								  case 'socket':
									  cb ( 'onFileUpload', file )
									  _set ( file );
									  break;
								  default:
									  //todo: set $http.post() to upload.php file
									  break;
							  }
						  }
						  return true;
					  };
					  function _finished ( files ) {
						  var file;
						  for( var _i = 0; _i < files.length; _i++ )
						  {
							  file = files[_i];
							  switch( file.status )
							  {
								  case  STATUS.SUCCESS:
									  defaultOptions.success ( file );
									  defaultOptions.complete ( file );
									  break;
							  }
						  }
					  };
					  function _enqueueFile ( file ) {
						  file.accepted = true;
						  if( file.status === STATUS.ADDED )
						  {
							  file.status = STATUS.QUEUED;
							  if( defaultOptions.autoProcessQueue )
							  {
								  return setTimeout ( (function() {
									  return processQueue ();
								  }), 1 );
							  }
						  }else
						  {
							  throw new Error ( "This file can't be queued because it has already been processed or was rejected." );
						  }
					  };
					  function processQueue () {
						  var i, parallelUploads, processingLength, queuedFiles;
						  parallelUploads = defaultOptions.parallelUploads;
						  processingLength = getUploadingFiles ().length;
						  i = processingLength;
						  if( processingLength >= parallelUploads )
						  {
							  return;
						  }
						  queuedFiles = getQueuedFiles ();
						  //if no queuedFiles
						  if( !(queuedFiles.length > 0) )
						  {
							  return;
						  }
						  while( i < parallelUploads )
						  {

							  //if no more queuedFiles
							  if( !queuedFiles.length )
							  {
								  return;
							  }
							  processFile ( queuedFiles.shift () );
							  i++;
						  }
					  };
					  function getUploadingFiles () {
						  var file, _i, _len, _ref, _results;
						  _results = [];
						  for( _i = 0; _i < files.length; _i++ )
						  {
							  file = files[_i];
							  if( file.status === STATUS.UPLOADING )
							  {
								  _results.push ( file );
							  }
						  }
						  return _results;
					  };
					  function processFile ( file ) {
						  return processFiles ( [file] );
					  };
					  function processFiles ( files ) {
						  var file, _i;
						  for( _i = 0; _i < files.length; _i++ )
						  {
							  file = files[_i];
							  file.processing = true;
							  file.status = STATUS.UPLOADING;
							  defaultOptions.processing ( file );
						  }
						  return uploadFiles ( files );
					  };
					  function getQueuedFiles () {
						  var file, _i, _results;
						  _results = [];
						  for( _i = 0; _i < files.length; _i++ )
						  {
							  file = files[_i];
							  if( file.status === STATUS.QUEUED )
							  {
								  _results.push ( file );
							  }
						  }
						  return _results;
					  };
					  function _errorProcessing ( files, message ) {
						  var file, _i, _len;
						  for( _i = 0; _i < files.length; _i++ )
						  {
							  file = files[_i];
							  file.status = STATUS.ERROR;
							  defaultOptions.error ( file, message );
							  defaultOptions.complete ( file );
						  }
					  };
					  /**
					   * Checks if the file meets the following criteria:
					   *    maxFiles, maxFilesize, isValidFile(fileType)
					   * @param file {object}
					   * @param done {callback}
					   * @returns {*}
					   */
					  function accept ( file, done ) {
						  /**
						   * Check if the file meets the options
						   */
						  if( defaultOptions.maxFiles && getAcceptedFiles ().length >= defaultOptions.maxFiles )
						  {
							  done.call ( this, defaultOptions.dictMaxFilesExceeded.replace ( "{{maxFiles}}", defaultOptions.maxFiles ) );
							  return defaultOptions.maxfilesexceeded ( file );
						  }else
						  {
							  if( file.size > defaultOptions.maxFilesize * 1024 * 1024 )
							  {
								  done.call ( this, defaultOptions.dictFileTooBig.replace ( "{{filesize}}", Math.round ( file.size / 1024 / 10.24 ) / 100 ).replace ( "{{maxFilesize}}", defaultOptions.maxFilesize ) );
							  }else if( !isValidFile ( file, defaultOptions.acceptedFiles ) )
							  {
								  done.call ( this, defaultOptions.dictInvalidFileType );
							  }else
							  {
								  done.call ( this, false );
							  }
						  }
						  return;
					  };
					  /**
					   * Checks if file is valide from acceptedFiles {string}
					   * @param file {object}
					   * @param acceptedFiles {string}
					   * @returns {boolean}
					   */
					  function isValidFile ( file, acceptedFiles ) {
						  var baseMimeType, mimeType, validType, _i, _len;
						  if( !acceptedFiles )
						  {
							  return true;
						  }
						  acceptedFiles = acceptedFiles.split ( "," );
						  mimeType = file.type;
						  baseMimeType = mimeType.replace ( /\/.*$/, "" );
						  for( _i = 0, _len = acceptedFiles.length; _i < _len; _i++ )
						  {
							  validType = acceptedFiles[_i];
							  validType = validType.trim ();
							  if( validType.charAt ( 0 ) === "." )
							  {
								  if( file.name.indexOf ( validType, file.name.length - validType.length ) !== -1 )
								  {
									  return true;
								  }
							  }else if( /\/\*$/.test ( validType ) )
							  {
								  if( baseMimeType === validType.replace ( /\/.*$/, "" ) )
								  {
									  return true;
								  }
							  }else
							  {
								  if( mimeType === validType )
								  {
									  return true;
								  }
							  }
						  }
						  return false;
					  };
					  /**
					   * Creates the originalImage and thumbnail base64 images, and appends key to file object
					   * @param file {object}
					   */
					  function getBase64Images ( file ) {
						  var fileReader;
						  fileReader = new FileReader;
						  fileReader.onload = function() {
							  var img;
							  img = new Image;
							  img.onload = function() {
								  var canvas, ctx, resizeInfo, thumbnail, _ref, _ref1, _ref2, _ref3;
								  file.width = img.width;
								  file.height = img.height;
								  resizeInfo = defaultOptions.resize ( file );
								  if( resizeInfo.trgWidth == null )
								  {
									  resizeInfo.trgWidth = defaultOptions.thumbnailWidth;
								  }
								  if( resizeInfo.trgHeight == null )
								  {
									  resizeInfo.trgHeight = defaultOptions.thumbnailHeight;
								  }
								  canvas = document.createElement ( "canvas" );
								  var original = document.createElement ( "canvas" );
								  ctx = canvas.getContext ( "2d" );
								  //create a canvas with original size
								  var oSize = original.getContext ( "2d" );
								  original.width = img.width;
								  original.height = img.height;
								  canvas.width = resizeInfo.trgWidth;
								  canvas.height = resizeInfo.trgHeight;
								  ctx.drawImage ( img, (_ref = resizeInfo.srcX) != null ? _ref : 0, (_ref1 = resizeInfo.srcY) != null ? _ref1 : 0, resizeInfo.srcWidth, resizeInfo.srcHeight, (_ref2 = resizeInfo.trgX) != null ? _ref2 : 0, (_ref3 = resizeInfo.trgY) != null ? _ref3 : 0, resizeInfo.trgWidth, resizeInfo.trgHeight );
								  thumbnail = canvas.toDataURL ( "image/png" );
								  //original size
								  oSize.drawImage ( img, 0, 0 );
								  file.originalImage = original.toDataURL ( "image/png" );
								  //add imageBase64 to object
								  file.thumbnail = thumbnail;
								  return defaultOptions.thumbnail ( file, thumbnail );
							  };
							  return img.src = fileReader.result;
						  };
						  return fileReader.readAsDataURL ( file );
					  };


					  /**
					   * Converst image from kb to string format
					   * @param size in kib
					   * @returns {string}
					   */
					  function getfilesize ( size ) {
						  var string;
						  if( size >= 100000000000 )
						  {
							  size = size / 100000000000;
							  string = "TB";
						  }else if( size >= 100000000 )
						  {
							  size = size / 100000000;
							  string = "GB";
						  }else if( size >= 100000 )
						  {
							  size = size / 100000;
							  string = "MB";
						  }else if( size >= 100 )
						  {
							  size = size / 100;
							  string = "KB";
						  }else
						  {
							  size = size * 10;
							  string = "b";
						  }
						  return "<strong>" + (Math.round ( size ) / 10) + "</strong> " + string;
					  };
					  /**
					   * Create element from String
					   * @param string
					   * @returns {*}
					   */
					  function createElement ( string ) {
						  var div;
						  div = document.createElement ( "div" );
						  div.innerHTML = string;
						  return div.childNodes[0];
					  };

					  /**
					   *
					   * @param callback {string}, takes the string and change to array to place multiple calls
					   * @param data {*}, data to pass
					   */
					  function cb ( callback, data ) {
						  // Executes the callbacks defined in the controller
						  // while safely failing if callback is not defined.
						  try
						  {
							  callbacks[callback ] ( data )
						  }catch( e )
						  {
							  // Callback not defined in the controller.
						  }
					  }

					  /**
					   * Increments the loading bar by a random amount
					   * but slows down as it progresses
					   */
					  function _inc ( file ) {

						  //if false dont start
						  if( file.status != STATUS.UPLOADING )
						  {
							  return;
						  }
						  var stat = file.upload.progress
						  var rnd = 0;
						  if( stat >= 0 && stat < 0.25 )
						  {
							  // Start out between 3 - 6% increments
							  rnd = (Math.random () * (5 - 3 + 1) + 3) / 100;
						  }else if( stat >= 0.25 && stat < 0.65 )
						  {
							  // increment between 0 - 3%
							  rnd = (Math.random () * 3) / 100;
						  }else if( stat >= 0.65 && stat < 0.9 )
						  {
							  // increment between 0 - 2%
							  rnd = (Math.random () * 2) / 100;
						  }else if( stat >= 0.9 && stat < 0.95 )
						  {
							  // finally, increment it .5 %
							  rnd = 0.005;
						  }else
						  {
							  // after 95%, don't increment:
							  rnd = 0;
						  }
						  file.upload.progress = file.upload.progress + rnd;
						  _set ( file );
					  }

					  /**
					   * Set the loading bar's width to a certain percent.
					   *
					   * @param n any value between 0 and 1
					   */
					  function _set ( file ) {
						  var deferred = $q.defer();

						  if( file.status != STATUS.UPLOADING )
						  {
							  return;
						  }


						  var n = file.upload.progress
						  var pct = (n * 100) + '%';
						  defaultOptions.uploadprogress ( file, pct )
						  $timeout.cancel ( file.incTimeout );
						  file.incTimeout = $timeout ( function() {
							  _inc ( file );
						  }, 250 );


						  if(n == 1 ){
							  deferred.resolve(file);
						  }

						  return deferred.promise;

					  }

					  $rootScope.$on ( 'dropZone:completed', function( e, file ) {
						  file.upload.progress = 1;
						  _set ( file ).then(function(file){
							  file.status = STATUS.SUCCESS;
							  $timeout(function(){
								  _finished ( [file] )
							  },1)
						  })
					  })
				  }
			  };
			  return directive;
		  }
	  ] );