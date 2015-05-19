var qq=qq||{};qq.extend=function(e,t){for(var i in t)e[i]=t[i]},qq.indexOf=function(e,t,i){if(e.indexOf)return e.indexOf(t,i);i=i||0;var n=e.length;for(0>i&&(i+=n);n>i;i++)if(i in e&&e[i]===t)return i;return-1},qq.getUniqueId=function(){var e=0;return function(){return e++}}(),qq.attach=function(e,t,i){e.addEventListener?e.addEventListener(t,i,!1):e.attachEvent&&e.attachEvent("on"+t,i)},qq.detach=function(e,t,i){e.removeEventListener?e.removeEventListener(t,i,!1):e.attachEvent&&e.detachEvent("on"+t,i)},qq.preventDefault=function(e){e.preventDefault?e.preventDefault():e.returnValue=!1},qq.insertBefore=function(e,t){t.parentNode.insertBefore(e,t)},qq.remove=function(e){e.parentNode.removeChild(e)},qq.contains=function(e,t){return e==t?!0:e.contains?e.contains(t):!!(8&t.compareDocumentPosition(e))},qq.toElement=function(){var e=document.createElement("div");return function(t){e.innerHTML=t;var i=e.firstChild;return e.removeChild(i),i}}(),qq.css=function(e,t){null!=t.opacity&&"string"!=typeof e.style.opacity&&"undefined"!=typeof e.filters&&(t.filter="alpha(opacity="+Math.round(100*t.opacity)+")"),qq.extend(e.style,t)},qq.hasClass=function(e,t){var i=new RegExp("(^| )"+t+"( |$)");return i.test(e.className)},qq.addClass=function(e,t){qq.hasClass(e,t)||(e.className+=" "+t)},qq.removeClass=function(e,t){var i=new RegExp("(^| )"+t+"( |$)");e.className=e.className.replace(i," ").replace(/^\s+|\s+$/g,"")},qq.setText=function(e,t){e.innerText=t,e.textContent=t},qq.children=function(e){for(var t=[],i=e.firstChild;i;)1==i.nodeType&&t.push(i),i=i.nextSibling;return t},qq.getByClass=function(e,t){if(e.querySelectorAll)return e.querySelectorAll("."+t);for(var i=[],n=e.getElementsByTagName("*"),s=n.length,o=0;s>o;o++)qq.hasClass(n[o],t)&&i.push(n[o]);return i},qq.obj2url=function(e,t,i){var n=[],s="&",o=function(e,i){var s=t?/\[\]$/.test(t)?t:t+"["+i+"]":i;"undefined"!=s&&"undefined"!=i&&n.push("object"==typeof e?qq.obj2url(e,s,!0):"[object Function]"===Object.prototype.toString.call(e)?encodeURIComponent(s)+"="+encodeURIComponent(e()):encodeURIComponent(s)+"="+encodeURIComponent(e))};if(!i&&t)s=/\?/.test(t)?/\?$/.test(t)?"":"&":"?",n.push(t),n.push(qq.obj2url(e));else if("[object Array]"===Object.prototype.toString.call(e)&&"undefined"!=typeof e)for(var r=0,a=e.length;a>r;++r)o(e[r],r);else if("undefined"!=typeof e&&null!==e&&"object"==typeof e)for(var r in e)o(e[r],r);else n.push(encodeURIComponent(t)+"="+encodeURIComponent(e));return n.join(s).replace(/^&/,"").replace(/%20/g,"+")};var qq=qq||{};qq.FileUploaderBasic=function(e){this._options={debug:!1,action:"/server/upload",params:{},button:null,multiple:!0,maxConnections:3,method:"POST",fieldName:"qqfile",allowedExtensions:[],sizeLimit:0,minSizeLimit:0,maxFilesCount:0,minFilesCount:0,onSubmit:function(){},onProgress:function(){},onComplete:function(){},onCancel:function(){},messages:{typeError:"{file} has invalid extension. Only {extensions} are allowed.",sizeError:"{file} is too large, maximum file size is {sizeLimit}.",minSizeError:"{file} is too small, minimum file size is {minSizeLimit}.",emptyError:"{file} is empty, please select files again without it.",onLeave:"The files are being uploaded, if you leave now the upload will be cancelled.",maxFilesError:"You must select less then {maxFilesCount} files.",minFilesError:"You must select more then {minFilesCount} files."},showMessage:function(e){alert(e)}},qq.extend(this._options,e),this._filesInProgress=0,this._filesUploaded=0,this._handler=this._createUploadHandler(),this._options.button&&(this._button=this._createUploadButton(this._options.button)),this._preventLeaveInProgress()},qq.FileUploaderBasic.prototype={setParams:function(e){this._options.params=e},getInProgress:function(){return this._filesInProgress},_createUploadButton:function(e){var t=this;return new qq.UploadButton({element:e,multiple:this._options.multiple&&qq.UploadHandlerXhr.isSupported(),onChange:function(e){t._onInputChange(e)}})},_createUploadHandler:function(){var e,t=this;e=qq.UploadHandlerXhr.isSupported()?"UploadHandlerXhr":"UploadHandlerForm";var i=new qq[e]({debug:this._options.debug,action:this._options.action,maxConnections:this._options.maxConnections,fieldName:this._options.fieldName,method:this._options.method,onProgress:function(e,i,n,s){t._onProgress(e,i,n,s),t._options.onProgress(e,i,n,s)},onComplete:function(e,i,n){t._onComplete(e,i,n),t._options.onComplete(e,i,n)},onCancel:function(e,i){t._onCancel(e,i),t._options.onCancel(e,i)}});return i},_preventLeaveInProgress:function(){var e=this;qq.attach(window,"beforeunload",function(t){if(e._filesInProgress){var t=t||window.event;return t.returnValue=e._options.messages.onLeave,e._options.messages.onLeave}})},_onSubmit:function(){this._filesInProgress++},_onProgress:function(){},_onComplete:function(e,t,i){this._filesInProgress--,i.error?this._options.showMessage(i.error):this._filesUploaded++},_onCancel:function(){this._filesInProgress--},_onInputChange:function(e){this._handler instanceof qq.UploadHandlerXhr?this._uploadFileList(e.files):this._validateFile(e)&&this._uploadFile(e),this._button.reset()},_uploadFileList:function(e){if(this._validateFiles(e))for(var t=0;t<e.length;t++)this._uploadFile(e[t])},_uploadFile:function(e){var t=this._handler.add(e),i=this._handler.getName(t);this._options.onSubmit(t,i)!==!1&&(this._onSubmit(t,i),this._handler.upload(t,this._options.params))},_validateFiles:function(e){var t=this._filesUploaded+e.length;if(this._options.maxFilesCount>0&&t>this._options.maxFilesCount)return this._error("maxFilesError","name"),!1;if(this._options.minFilesCount>0&&t<this._options.minFilesCount)return this._error("minFilesError","name"),!1;for(var i=0;i<e.length;i++)if(!this._validateFile(e[i]))return!1;return!0},_validateFile:function(e){var t,i;return e.value?t=e.value.replace(/.*(\/|\\)/,""):(t=null!=e.fileName?e.fileName:e.name,i=null!=e.fileSize?e.fileSize:e.size),this._isAllowedExtension(t)?0===i?(this._error("emptyError",t),!1):i&&this._options.sizeLimit&&i>this._options.sizeLimit?(this._error("sizeError",t),!1):i&&i<this._options.minSizeLimit?(this._error("minSizeError",t),!1):!0:(this._error("typeError",t),!1)},_error:function(e,t){function i(e,t){n=n.replace(e,t)}var n=this._options.messages[e];i("{file}",this._formatFileName(t)),i("{extensions}",this._options.allowedExtensions.join(", ")),i("{sizeLimit}",this._formatSize(this._options.sizeLimit)),i("{minSizeLimit}",this._formatSize(this._options.minSizeLimit)),i("{maxFilesCount}",this._options.maxFilesCount),i("{minFilesCount}",this._options.minFilesCount),this._options.showMessage(n)},_formatFileName:function(e){return e.length>33&&(e=e.slice(0,19)+"..."+e.slice(-13)),e},_isAllowedExtension:function(e){var t=-1!==e.indexOf(".")?e.replace(/.*[.]/,"").toLowerCase():"",i=this._options.allowedExtensions;if(!i.length)return!0;for(var n=0;n<i.length;n++)if(i[n].toLowerCase()==t)return!0;return!1},_formatSize:function(e){var t=-1;do e/=1024,t++;while(e>99);return Math.max(e,.1).toFixed(1)+["kB","MB","GB","TB","PB","EB"][t]}},qq.FileUploader=function(e){qq.FileUploaderBasic.apply(this,arguments),qq.extend(this._options,{element:null,listElement:null,template:'<div class="qq-uploader"><div class="qq-upload-drop-area"><span>Drop files here to upload</span></div><div class="qq-upload-button">Upload a file</div><ul class="qq-upload-list"></ul></div>',fileTemplate:'<li><span class="qq-upload-file"></span><span class="qq-upload-spinner"></span><span class="qq-upload-size"></span><a class="qq-upload-cancel" href="#">Cancel</a><span class="qq-upload-failed-text">Failed</span></li>',classes:{button:"qq-upload-button",drop:"qq-upload-drop-area",dropActive:"qq-upload-drop-area-active",list:"qq-upload-list",file:"qq-upload-file",spinner:"qq-upload-spinner",size:"qq-upload-size",cancel:"qq-upload-cancel",success:"qq-upload-success",fail:"qq-upload-fail"}}),qq.extend(this._options,e),this._element=this._options.element,this._element.innerHTML=this._options.template,this._listElement=this._options.listElement||this._find(this._element,"list"),this._classes=this._options.classes,this._button=this._createUploadButton(this._find(this._element,"button")),this._bindCancelEvent(),this._setupDragDrop()},qq.extend(qq.FileUploader.prototype,qq.FileUploaderBasic.prototype),qq.extend(qq.FileUploader.prototype,{_find:function(e,t){var i=qq.getByClass(e,this._options.classes[t])[0];if(!i)throw new Error("element not found "+t);return i},_setupDragDrop:function(){var e=this,t=this._find(this._element,"drop"),i=new qq.UploadDropZone({element:t,onEnter:function(i){qq.addClass(t,e._classes.dropActive),i.stopPropagation()},onLeave:function(e){e.stopPropagation()},onLeaveNotDescendants:function(){qq.removeClass(t,e._classes.dropActive)},onDrop:function(i){t.style.display="none",qq.removeClass(t,e._classes.dropActive),e._uploadFileList(i.dataTransfer.files)}});t.style.display="none",qq.attach(document,"dragenter",function(e){i._isValidFileDrag(e)&&(t.style.display="block")}),qq.attach(document,"dragleave",function(e){if(i._isValidFileDrag(e)){var n=document.elementFromPoint(e.clientX,e.clientY);n&&"HTML"!=n.nodeName||(t.style.display="none")}})},_onSubmit:function(e,t){qq.FileUploaderBasic.prototype._onSubmit.apply(this,arguments),this._addToList(e,t)},_onProgress:function(e,t,i,n){qq.FileUploaderBasic.prototype._onProgress.apply(this,arguments);var s=this._getItemByFileId(e),o=this._find(s,"size");o.style.display="inline";var r;r=i!=n?Math.round(i/n*100)+"% from "+this._formatSize(n):this._formatSize(n),qq.setText(o,r)},_onComplete:function(e,t,i){qq.FileUploaderBasic.prototype._onComplete.apply(this,arguments);var n=this._getItemByFileId(e);qq.remove(this._find(n,"cancel")),qq.remove(this._find(n,"spinner")),i.success?qq.addClass(n,this._classes.success):qq.addClass(n,this._classes.fail)},_addToList:function(e,t){var i=qq.toElement(this._options.fileTemplate);i.qqFileId=e;var n=this._find(i,"file");qq.setText(n,this._formatFileName(t)),this._find(i,"size").style.display="none",this._listElement.appendChild(i)},_getItemByFileId:function(e){for(var t=this._listElement.firstChild;t;){if(t.qqFileId==e)return t;t=t.nextSibling}},_bindCancelEvent:function(){var e=this,t=this._listElement;qq.attach(t,"click",function(t){t=t||window.event;var i=t.target||t.srcElement;if(qq.hasClass(i,e._classes.cancel)){qq.preventDefault(t);var n=i.parentNode;e._handler.cancel(n.qqFileId),qq.remove(n)}})}}),qq.UploadDropZone=function(e){this._options={element:null,onEnter:function(){},onLeave:function(){},onLeaveNotDescendants:function(){},onDrop:function(){}},qq.extend(this._options,e),this._element=this._options.element,this._disableDropOutside(),this._attachEvents()},qq.UploadDropZone.prototype={_disableDropOutside:function(){qq.UploadDropZone.dropOutsideDisabled||(qq.attach(document,"dragover",function(e){e.dataTransfer&&(e.dataTransfer.dropEffect="none",e.preventDefault())}),qq.UploadDropZone.dropOutsideDisabled=!0)},_attachEvents:function(){var e=this;qq.attach(e._element,"dragover",function(t){if(e._isValidFileDrag(t)){var i=t.dataTransfer.effectAllowed;t.dataTransfer.dropEffect="move"==i||"linkMove"==i?"move":"copy",t.stopPropagation(),t.preventDefault()}}),qq.attach(e._element,"dragenter",function(t){e._isValidFileDrag(t)&&e._options.onEnter(t)}),qq.attach(e._element,"dragleave",function(t){if(e._isValidFileDrag(t)){e._options.onLeave(t);var i=document.elementFromPoint(t.clientX,t.clientY);qq.contains(this,i)||e._options.onLeaveNotDescendants(t)}}),qq.attach(e._element,"drop",function(t){e._isValidFileDrag(t)&&(t.preventDefault(),e._options.onDrop(t))})},_isValidFileDrag:function(e){var t=e.dataTransfer,i=navigator.userAgent.indexOf("AppleWebKit")>-1;return t&&"none"!=t.effectAllowed&&(t.files||!i&&t.types.contains&&t.types.contains("Files"))}},qq.UploadButton=function(e){this._options={element:null,multiple:!1,name:"file",onChange:function(){},hoverClass:"qq-upload-button-hover",focusClass:"qq-upload-button-focus"},qq.extend(this._options,e),this._element=this._options.element,qq.css(this._element,{position:"relative",overflow:"hidden",direction:"ltr"}),this._input=this._createInput()},qq.UploadButton.prototype={getInput:function(){return this._input},reset:function(){this._input.parentNode&&qq.remove(this._input),qq.removeClass(this._element,this._options.focusClass),this._input=this._createInput()},_createInput:function(){var e=document.createElement("input");this._options.multiple&&e.setAttribute("multiple","multiple"),e.setAttribute("type","file"),e.setAttribute("name",this._options.name),qq.css(e,{position:"absolute",right:0,top:0,fontFamily:"Arial",fontSize:"118px",margin:0,padding:0,cursor:"pointer",opacity:0}),this._element.appendChild(e);var t=this;return qq.attach(e,"change",function(){t._options.onChange(e)}),qq.attach(e,"mouseover",function(){qq.addClass(t._element,t._options.hoverClass)}),qq.attach(e,"mouseout",function(){qq.removeClass(t._element,t._options.hoverClass)}),qq.attach(e,"focus",function(){qq.addClass(t._element,t._options.focusClass)}),qq.attach(e,"blur",function(){qq.removeClass(t._element,t._options.focusClass)}),window.attachEvent&&e.setAttribute("tabIndex","-1"),e}},qq.UploadHandlerAbstract=function(e){this._options={debug:!1,action:"/upload.php",method:"POST",fieldName:"qqfile",maxConnections:999,onProgress:function(){},onComplete:function(){},onCancel:function(){}},qq.extend(this._options,e),this._queue=[],this._params=[]},qq.UploadHandlerAbstract.prototype={log:function(e){this._options.debug&&window.console&&console.log("[uploader] "+e)},add:function(){},upload:function(e,t){var i=this._queue.push(e),n={};qq.extend(n,t),this._params[e]=n,i<=this._options.maxConnections&&this._upload(e,this._params[e])},cancel:function(e){this._cancel(e),this._dequeue(e)},cancelAll:function(){for(var e=0;e<this._queue.length;e++)this._cancel(this._queue[e]);this._queue=[]},getName:function(){},getSize:function(){},getQueue:function(){return this._queue},_upload:function(){},_cancel:function(){},_dequeue:function(e){var t=qq.indexOf(this._queue,e);this._queue.splice(t,1);var i=this._options.maxConnections;if(this._queue.length>=i&&i>t){var n=this._queue[i-1];this._upload(n,this._params[n])}}},qq.UploadHandlerForm=function(){qq.UploadHandlerAbstract.apply(this,arguments),this._inputs={}},qq.extend(qq.UploadHandlerForm.prototype,qq.UploadHandlerAbstract.prototype),qq.extend(qq.UploadHandlerForm.prototype,{add:function(e){e.setAttribute("name",this._options.fieldName);var t="qq-upload-handler-iframe"+qq.getUniqueId();return this._inputs[t]=e,e.parentNode&&qq.remove(e),t},getName:function(e){return this._inputs[e].value.replace(/.*(\/|\\)/,"")},_cancel:function(e){this._options.onCancel(e,this.getName(e)),delete this._inputs[e];var t=document.getElementById(e);t&&(t.setAttribute("src","javascript:false;"),qq.remove(t))},_upload:function(e,t){var i=this._inputs[e];if(!i)throw new Error("file with passed id was not added, or already uploaded or cancelled");var n=this.getName(e),s=this._createIframe(e),o=this._createForm(s,t);o.appendChild(i);var r=this;return this._attachLoadEvent(s,function(){r.log("iframe loaded");var t=r._getIframeContentJSON(s);r._options.onComplete(e,n,t),r._dequeue(e),delete r._inputs[e],setTimeout(function(){qq.remove(s)},1)}),o.submit(),qq.remove(o),e},_attachLoadEvent:function(e,t){qq.attach(e,"load",function(){e.parentNode&&(e.contentDocument&&e.contentDocument.body&&"false"==e.contentDocument.body.innerHTML||t())})},_getIframeContentJSON:function(iframe){var doc=iframe.contentDocument?iframe.contentDocument:iframe.contentWindow.document,response;this.log("converting iframe's innerHTML to JSON"),this.log("innerHTML = "+doc.body.innerHTML);try{response=eval("("+doc.body.innerHTML+")")}catch(err){response={}}return response},_createIframe:function(e){var t=qq.toElement('<iframe src="javascript:false;" name="'+e+'" />');return t.setAttribute("id",e),t.style.display="none",document.body.appendChild(t),t},_createForm:function(e,t){var i=qq.toElement('<form enctype="multipart/form-data"></form>'),n=qq.obj2url(t,this._options.action);i.setAttribute("method",this._options.method),i.setAttribute("action",n),i.setAttribute("target",e.name),i.style.display="none";var s=$('meta[name="csrf-token"]').attr("content"),o=$('meta[name="csrf-param"]').attr("content"),r=qq.toElement('<input type="hidden" />');return r.setAttribute("name",o),r.setAttribute("value",s),i.appendChild(r),document.body.appendChild(i),i}}),qq.UploadHandlerXhr=function(){qq.UploadHandlerAbstract.apply(this,arguments),this._files=[],this._xhrs=[],this._loaded=[]},qq.UploadHandlerXhr.isSupported=function(){var e=document.createElement("input");return e.type="file","multiple"in e&&"undefined"!=typeof File&&"undefined"!=typeof(new XMLHttpRequest).upload},qq.extend(qq.UploadHandlerXhr.prototype,qq.UploadHandlerAbstract.prototype),qq.extend(qq.UploadHandlerXhr.prototype,{add:function(e){if(!(e instanceof File))throw new Error("Passed obj in not a File (in qq.UploadHandlerXhr)");return this._files.push(e)-1},getName:function(e){var t=this._files[e];return null!=t.fileName?t.fileName:t.name},getSize:function(e){var t=this._files[e];return null!=t.fileSize?t.fileSize:t.size},getLoaded:function(e){return this._loaded[e]||0},_upload:function(e,t){var i=this._files[e],n=this.getName(e),s=this.getSize(e);this._loaded[e]=0;var o=this._xhrs[e]=new XMLHttpRequest,r=this;o.upload.onprogress=function(t){t.lengthComputable&&(r._loaded[e]=t.loaded,r._options.onProgress(e,n,t.loaded,t.total))},o.onreadystatechange=function(){4==o.readyState&&r._onComplete(e,o)},t=t||{},t[this._options.fieldName]=n;var a=qq.obj2url(t,this._options.action);o.open(this._options.method,a,!0),o.setRequestHeader("X-Requested-With","XMLHttpRequest"),o.setRequestHeader("X-File-Name",encodeURIComponent(n)),o.setRequestHeader("X-File-Size",s),o.setRequestHeader("X-File-Type",i.type),o.setRequestHeader("Content-Type","application/octet-stream"),$.rails&&$.rails.CSRFProtection(o),o.send(i)},_onComplete:function(id,xhr){if(this._files[id]){var name=this.getName(id),size=this.getSize(id);if(this._options.onProgress(id,name,size,size),[200,201].indexOf(xhr.status)>-1){this.log("xhr - server response received"),this.log("responseText = "+xhr.responseText);var response;try{response=eval("("+xhr.responseText+")")}catch(err){response={}}this._options.onComplete(id,name,response)}else this._options.onComplete(id,name,{});this._files[id]=null,this._xhrs[id]=null,this._dequeue(id)}},_cancel:function(e){this._options.onCancel(e,this.getName(e)),this._files[e]=null,this._xhrs[e]&&(this._xhrs[e].abort(),this._xhrs[e]=null)}});