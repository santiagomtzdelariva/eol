/*
Copyright (c) 2003-2012, CKSource - Frederico Knabben. All rights reserved.
For licensing, see LICENSE.html or http://ckeditor.com/license
*/
CKEDITOR.plugins.add("devtools",{lang:["en","bg","cs","cy","da","de","el","eo","et","fa","fi","fr","gu","he","hr","it","nb","nl","no","pl","pt-br","tr","ug","uk","vi","zh-cn"],init:function(e){e._.showDialogDefinitionTooltips=1},onLoad:function(){CKEDITOR.document.appendStyleText(CKEDITOR.config.devtools_styles||"#cke_tooltip { padding: 5px; border: 2px solid #333; background: #ffffff }#cke_tooltip h2 { font-size: 1.1em; border-bottom: 1px solid; margin: 0; padding: 1px; }#cke_tooltip ul { padding: 0pt; list-style-type: none; }")}}),function(){function e(e,t,i,n){var a=e.lang.devTools,o='<a href="http://docs.cksource.com/ckeditor_api/symbols/CKEDITOR.dialog.definition.'+(i?"text"==i.type?"textInput":i.type:"content")+'.html" target="_blank">'+(i?i.type:"content")+"</a>",r="<h2>"+a.title+"</h2><ul><li><strong>"+a.dialogName+"</strong> : "+t.getName()+"</li><li><strong>"+a.tabName+"</strong> : "+n+"</li>";return i&&(r+="<li><strong>"+a.elementId+"</strong> : "+i.id+"</li>"),r+="<li><strong>"+a.elementType+"</strong> : "+o+"</li>",r+"</ul>"}function t(e,t,n,a,o,r){var s=t.getDocumentPosition(),l={"z-index":CKEDITOR.dialog._.currentZIndex+10,top:s.y+t.getSize("height")+"px"};if(i.setHtml(e(n,a,o,r)),i.show(),"rtl"==n.lang.dir){var c=CKEDITOR.document.getWindow().getViewPaneSize();l.right=c.width-s.x-t.getSize("width")+"px"}else l.left=s.x+"px";i.setStyles(l)}var i;CKEDITOR.on("reset",function(){i&&i.remove(),i=null}),CKEDITOR.on("dialogDefinition",function(n){var a=n.editor;if(a._.showDialogDefinitionTooltips){i||(i=CKEDITOR.dom.element.createFromHtml('<div id="cke_tooltip" tabindex="-1" style="position: absolute"></div>',CKEDITOR.document),i.hide(),i.on("mouseover",function(){this.show()}),i.on("mouseout",function(){this.hide()}),i.appendTo(CKEDITOR.document.getBody()));var o=n.data.definition.dialog,r=a.config.devtools_textCallback||e;o.on("load",function(){for(var e,n=o.parts.tabs.getChildren(),s=0,l=n.count();l>s;s++)e=n.getItem(s),e.on("mouseover",function(){var e=this.$.id;t(r,this,a,o,null,e.substring(4,e.lastIndexOf("_")))}),e.on("mouseout",function(){i.hide()});o.foreach(function(e){if(!(e.type in{hbox:1,vbox:1})){var n=e.getElement();n&&(n.on("mouseover",function(){t(r,this,a,o,e,o._.currentTabId)}),n.on("mouseout",function(){i.hide()}))}})})}})}();