/*
Copyright (c) 2003-2012, CKSource - Frederico Knabben. All rights reserved.
For licensing, see LICENSE.html or http://ckeditor.com/license
*/
!function(){CKEDITOR.document;CKEDITOR.dialog.add("templates",function(e){function t(e,t){e.setHtml("");for(var n=0,a=t.length;a>n;n++)for(var o=CKEDITOR.getTemplates(t[n]),r=o.imagesPath,s=o.templates,l=s.length,c=0;l>c;c++){var d=s[c],u=i(d,r);u.setAttribute("aria-posinset",c+1),u.setAttribute("aria-setsize",l),e.append(u)}}function i(e,t){var i=CKEDITOR.dom.element.createFromHtml('<a href="javascript:void(0)" tabIndex="-1" role="option" ><div class="cke_tpl_item"></div></a>'),a='<table style="width:350px;" class="cke_tpl_preview" role="presentation"><tr>';return e.image&&t&&(a+='<td class="cke_tpl_preview_img"><img src="'+CKEDITOR.getUrl(t+e.image)+'"'+(CKEDITOR.env.ie6Compat?' onload="this.width=this.width"':"")+' alt="" title=""></td>'),a+='<td style="white-space:normal;"><span class="cke_tpl_title">'+e.title+"</span><br/>",e.description&&(a+="<span>"+e.description+"</span>"),a+="</td></tr></table>",i.getFirst().setHtml(a),i.on("click",function(){n(e.html)}),i}function n(t){var i=CKEDITOR.dialog.getCurrent(),n=i.getValueOf("selectTpl","chkInsertOpt");n?(e.on("contentDom",function(t){t.removeListener(),i.hide();var n=new CKEDITOR.dom.range(e.document);n.moveToElementEditStart(e.document.getBody()),n.select(1),setTimeout(function(){e.fire("saveSnapshot")},0)}),e.fire("saveSnapshot"),e.setData(t)):(e.insertHtml(t),i.hide())}function a(e){var t=e.data.getTarget(),i=o.equals(t);if(i||o.contains(t)){var n,a=e.data.getKeystroke(),r=o.getElementsByTag("a");if(r){if(i)n=r.getItem(0);else switch(a){case 40:n=t.getNext();break;case 38:n=t.getPrevious();break;case 13:case 32:t.fire("click")}n&&(n.focus(),e.data.preventDefault())}}}CKEDITOR.skins.load(e,"templates");var o,r="cke_tpl_list_label_"+CKEDITOR.tools.getNextNumber(),s=e.lang.templates,l=e.config;return{title:e.lang.templates.title,minWidth:CKEDITOR.env.ie?440:400,minHeight:340,contents:[{id:"selectTpl",label:s.title,elements:[{type:"vbox",padding:5,children:[{id:"selectTplText",type:"html",html:"<span>"+s.selectPromptMsg+"</span>"},{id:"templatesList",type:"html",focus:!0,html:'<div class="cke_tpl_list" tabIndex="-1" role="listbox" aria-labelledby="'+r+'"><div class="cke_tpl_loading"><span></span></div></div><span class="cke_voice_label" id="'+r+'">'+s.options+"</span>"},{id:"chkInsertOpt",type:"checkbox",label:s.insertOption,"default":l.templates_replaceContent}]}]}],buttons:[CKEDITOR.dialog.cancelButton],onShow:function(){var e=this.getContentElement("selectTpl","templatesList");o=e.getElement(),CKEDITOR.loadTemplates(l.templates_files,function(){var i=(l.templates||"default").split(",");i.length?(t(o,i),e.focus()):o.setHtml('<div class="cke_tpl_empty"><span>'+s.emptyListMsg+"</span></div>")}),this._.element.on("keydown",a)},onHide:function(){this._.element.removeListener("keydown",a)}}})}();