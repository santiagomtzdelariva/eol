/*
Copyright (c) 2003-2012, CKSource - Frederico Knabben. All rights reserved.
For licensing, see LICENSE.html or http://ckeditor.com/license
*/
CKEDITOR.dialog.add("anchor",function(e){function t(e,t){return e.createFakeElement(t,"cke_anchor","anchor")}var i=function(e){this._.selectedElement=e;var t=e.data("cke-saved-name");this.setValueOf("info","txtName",t||"")};return{title:e.lang.anchor.title,minWidth:300,minHeight:60,onOk:function(){var i=this,n=CKEDITOR.tools.trim(i.getValueOf("info","txtName")),a={name:n,"data-cke-saved-name":n};if(i._.selectedElement)if(i._.selectedElement.data("cke-realelement")){var o=t(e,e.document.createElement("a",{attributes:a}));o.replace(i._.selectedElement)}else i._.selectedElement.setAttributes(a);else{var r=e.getSelection(),s=r&&r.getRanges()[0];if(s.collapsed){CKEDITOR.plugins.link.synAnchorSelector&&(a["class"]="cke_anchor_empty"),CKEDITOR.plugins.link.emptyAnchorFix&&(a.contenteditable="false",a["data-cke-editable"]=1);var l=e.document.createElement("a",{attributes:a});CKEDITOR.plugins.link.fakeAnchor&&(l=t(e,l)),s.insertNode(l)}else{CKEDITOR.env.ie&&CKEDITOR.env.version<9&&(a["class"]="cke_anchor");var c=new CKEDITOR.style({element:"a",attributes:a});c.type=CKEDITOR.STYLE_INLINE,c.apply(e.document)}}},onHide:function(){delete this._.selectedElement},onShow:function(){var t,n=this,a=e.getSelection(),o=a.getSelectedElement();if(o)if(CKEDITOR.plugins.link.fakeAnchor){var r=CKEDITOR.plugins.link.tryRestoreFakeAnchor(e,o);r&&i.call(n,r),n._.selectedElement=o}else o.is("a")&&o.hasAttribute("name")&&i.call(n,o);else t=CKEDITOR.plugins.link.getSelectedLink(e),t&&(i.call(n,t),a.selectElement(t));n.getContentElement("info","txtName").focus()},contents:[{id:"info",label:e.lang.anchor.title,accessKey:"I",elements:[{type:"text",id:"txtName",label:e.lang.anchor.name,required:!0,validate:function(){return this.getValue()?!0:(alert(e.lang.anchor.errorName),!1)}}]}]}});