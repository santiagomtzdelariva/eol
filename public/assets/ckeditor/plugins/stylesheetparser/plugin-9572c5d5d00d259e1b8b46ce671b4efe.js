/*
Copyright (c) 2003-2012, CKSource - Frederico Knabben. All rights reserved.
For licensing, see LICENSE.html or http://ckeditor.com/license
*/
!function(){function e(e,t,i){var n=e.join(" ");n=n.replace(/(,|>|\+|~)/g," "),n=n.replace(/\[[^\]]*/g,""),n=n.replace(/#[^\s]*/g,""),n=n.replace(/\:{1,2}[^\s]*/g,""),n=n.replace(/\s+/g," ");for(var a=n.split(" "),o=[],r=0;r<a.length;r++){var s=a[r];i.test(s)&&!t.test(s)&&-1==CKEDITOR.tools.indexOf(o,s)&&o.push(s)}return o}function t(t,i,n){var a,o=[],r=[];for(a=0;a<t.styleSheets.length;a++){var s=t.styleSheets[a],l=s.ownerNode||s.owningElement;if(!(l.getAttribute("data-cke-temp")||s.href&&"chrome://"==s.href.substr(0,9)))for(var c=s.cssRules||s.rules,d=0;d<c.length;d++)r.push(c[d].selectorText)}var u=e(r,i,n);for(a=0;a<u.length;a++){var h=u[a].split("."),p=h[0].toLowerCase(),m=h[1];o.push({name:p+"."+m,element:p,attributes:{"class":m}})}return o}CKEDITOR.plugins.add("stylesheetparser",{requires:["styles"],onLoad:function(){var e=CKEDITOR.editor.prototype;e.getStylesSet=CKEDITOR.tools.override(e.getStylesSet,function(e){return function(i){var n=this;e.call(this,function(e){var a=n.config.stylesheetParser_skipSelectors||/(^body\.|^\.)/i,o=n.config.stylesheetParser_validSelectors||/\w+\.\w+/;i(n._.stylesDefinitions=e.concat(t(n.document.$,a,o)))})}})}})}();