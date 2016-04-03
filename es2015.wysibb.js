/*global CURLANG:true, WBBPRESET:true */

!function () {
	'use strict';
	
	var wbbdebug=true;
	
	var CURLANG = {
		bold: 'Bold',
		italic: 'Italic',
		underline: 'Underline',
		strike: 'Strike',
		link: 'Link',
		img: 'Insert image',
		sup: 'Superscript',
		sub: 'Subscript',
		alignleft: 'Align left',
		aligncenter: 'Align center',
		alignright: 'Align right',
		table: 'Insert table',
		bullist: '• Unordered list',
		numlist: '1. Ordered list',
		quote: 'Quote',
		offtop: 'Offtop',
		code: 'Code',
		spoiler: 'Spoiler',
		fontcolor: 'Font color',
		fontsize: 'Font size',
		fontfamily: 'Font family',
		size_tiny: 'Very small',
		size_small: 'Small',
		size_normal: 'Normal',
		size_big: 'Big',
		size_huge: 'Very big',
		smilebox: 'Insert emoticon',
		video: 'Insert YouTube',
		removeFormat:'Remove Format',
		
		modal_link_title: 'Insert link',
		modal_link_text: 'Display text',
		modal_link_url: 'URL',
		modal_email_text: 'Display email',
		modal_email_url: 'Email',
		modal_link_tab1: 'Insert URL',
		
		modal_img_title: 'Insert image',
		modal_img_tab1: 'Insert URL',
		modal_img_tab2: 'Upload image',
		modal_imgsrc_text: 'Enter image URL',
		modal_img_btn: 'Choose file',
		add_attach: 'Add Attachment',
		
		modal_video_text: 'Enter the URL of the video',
		
		close: 'Close',
		save: 'Save',
		cancel: 'Cancel',
		remove: 'Delete',
		
		validation_err: 'The entered data is invalid',
		error_onupload: 'Error during file upload',
		
		fileupload_text1: 'Drop file here',
		fileupload_text2: 'or',
		
		loading: 'Loading',
		auto: 'Auto',
		views: 'Views',
		downloads: 'Downloads',
		
		// smiles
		sm1: 'Smile',
		sm2: 'Laughter',
		sm3: 'Wink',
		sm4: 'Thank you',
		sm5: 'Scold',
		sm6: 'Shock',
		sm7: 'Angry',
		sm8: 'Pain',
		sm9: 'Sick',
	};
	
	class Wysibb {
		constructor (textarea, settings) {
			this.WBBLANG['en'] = CURLANG;
			
			if ( settings && settings.deflang && typeof this.WBBLANG[ settings.deflang ] !== 'undefined' ) {
				CURLANG = this.WBBLANG[ settings.deflang ];
			}
			
			if ( settings && settings.lang && typeof this.WBBLANG[ settings.lang ] !== 'undefined' ) {
				CURLANG = this.WBBLANG[ settings.lang ];
			}
			
			this.textarea = textarea;
			this._textarea = textarea.cloneNode();
			
			this.id = this.textarea.id || this.setUUID(this.textarea);
			this.options = {
        bbmode: false,
        onlyBBMode: false,
        themeName: 'default',
        bodyClass : '',
        lang : 'en',
        tabInsert : true,
        imgupload : false,
        img_uploadurl : '',
        img_maxwidth : 800,
        img_maxheight : 800,
        iframe_height : 480,
        iframe_width : 640,
        hotkeys : true,
        showHotkeys : true,
        autoresize : true,
        resize_maxheight : 800,
        loadPageStyles : true,
        traceTextarea : true,
        smileConversion : true,
        buttons: 'bold,italic,underline,strike,sup,sub,|,img,video,link,|,bullist,numlist,|,offtop,color,size,font,|,alignleft,aligncenter,alignright,|,quote,code,table,removeFormat',
				allButtons : this.buttonConfig,
				systr : {
					'<br/>' : '\n',
					'<span class="wbbtab">{SELTEXT}</span>' : '   {SELTEXT}',
				},
				customRules : {
					td : [
						[
							'[td]{SELTEXT}[/td]', {
								seltext : {
									rgx : false,
									attr : false,
									sel : false,
								},
							},
						],
					],
					tr : [
						[
							'[tr]{SELTEXT}[/tr]', {
								seltext : {
									rgx : false,
									attr : false,
									sel : false,
								},
							},
						],
					],
					table : [
						[
							'[table]{SELTEXT}[/table]', {
								seltext : {
									rgx : false,
									attr : false,
									sel : false,
								},
							},
						],
					],
				},
				smileList : [ ],
				attrWrap : [
          'src',
          'href',
        ],
			};
			
			this.initted = this.options.onlyBBmode;
			
			if(!this.options.themePrefix) {
				var links = document.querySelectorAll('link');
				for(var link of links) {
					let sriptMatch = link.href.match( /(.*\/)(.*)\/wbbtheme\.css.*$/ );
					if ( sriptMatch !== null ) {
						this.options.themeName = sriptMatch[ 2 ];
						this.options.themePrefix = sriptMatch[ 1 ];
					}
				}
			}
			
			if(typeof WBBPRESET !== 'undefined') {
				for(let key in WBBPRESET.allButtons) {
					let preset = WBBPRESET[key];
					if( preset.transform && this.options.allButtons[key]) {
						delete this.options.allButtons[key].transform;
					}
				}
				extend(true, this.options, settings);
			}
			
			if ( settings && settings.allButtons ) {
				for(let key in settings.allButtons) {
					let setting = WBBPRESET[key];
					if( setting.transform && this.options.allButtons[key]) {
						delete this.options.allButtons[key].transform;
					}
				}
			}
			$.extend( true, this.options, settings );

			this.lastid = 1;
		}
		
		init () {
			if(wbbdebug) {
				console.log('Initialized');
			}
			// check for mobile
			this.isMobile = this._isMobile();
			
			if(this.options.onlyBBmode === true) {
				this.options.bbmode = true;
			}
			
			// create array of controls for queryState
			this.controllers = [ ];
			
			// convert button string to array
			this.options.buttons = this.options.buttons.toLowerCase();
			this.options.buttons = this.options.buttons.split( ',' );
			
			// init system transforms
			this.options.allButtons[ '_systr' ] = { };
			this.options.allButtons[ '_systr' ][ 'transform' ] = this.options.systr;
			
			this.smileFind();
			this.initTransforms();
			this.build();
			this.initModal();
			if(this.options.hotkeys === true && !this.isMobile) {
				this.initHotkeys();
			}
			
			// sort smiles
			if ( this.options.smileList && this.options.smileList.length > 0 ) {
				this.options.smileList.sort( function ( a, b ) {
					return b.bbcode.length - a.bbcode.length;
				} );
			}
			
			var form = getClosest(this.textarea, 'form');
			// submit and preview form actions
			var actionButtons = form.querySelectorAll('[id*="preview"],[id*="submit"],[class*="preview"],[class*="submit"],[name*="preview"],[name*="submit"],[value*="preview"],[value*="submit"]');
			
			for(var action of actionButtons) {
				action.addEventListener('mousedown', function (event) {
					if(wbbdebug) {
						console.log(event);
					}
					
					this.sync();
					
					setTimeout(function () {
						if(this.options.bbmode === false) {
							this._textarea.removeAttribute('wbbsync');
							this._textarea.value = '';
						}
					}, 1000);
				}.bind(this));
			}
			
			if ( this.options.initCallback ) {
				this.options.initCallback.call( this );
			}
		}
		
		// TODO: initTransforms
		initTransforms () {
			if(wbbdebug) {
				console.log('Create rules for transform HTML=>BB');
			}
			
			var options = this.options;
			if(!options.rules) {
				options.rules = {};
			}
			
			if(!options.groups) {
				options.groups = {};
			}
			
			var btnlist = options.buttons.slice();
			btnlist.push('_systr');
			
			for(var idx = 0, len = btnlist.length; idx < len; idx++) {
				var optBtn = options.allButtons[btnlist[idx]];
				
				if(!optBtn) {
					continue;
				}
				
				optBtn.en = true;
				
				// check for simplebbcode
				if(optBtn.simplebbcode && Array.isArray(optBtn.simplebbcode) && optBtn.simplebbcode.length === 2) {
					optBtn.bbcode = optBtn.html = `${optBtn.simplebbcode[0]} {SELTEXT} ${optBtn.simplebbcode[1]}`;
					if(optBtn.transform) delete optBtn.transform;
					if(optBtn.modal) delete optBtn.modal;
				}
				
				if(optBtn.type === 'select' ) {
					var optlist = optBtn.options;
					
					if(typeof optBtn.options === 'string') {
						optlist = optBtn.options.split(',');
						for(var selopt of optlist) {
							if(!btnlist.includes(selopt)) {
								btnlist.push(selopt);
							} 
						}
					}
					
					if(optBtn.transform && !optBtn.skipRules) {
						var btnTransform = extend({}, optBtn.transform);
						
						
						for(let btnHtml in btnTransform) {
							let origHtml = btnHtml;
							let bbcode = btnTransform[btnHtml];
							
							if(!optBtn.bbSelector) {
								optBtn.bbSelector = [];
							}
							
							if(optBtn.bbSelector.indexOf(bbcode) === -1) {
								optBtn.bbSelector.push(bbcode);
							}
							
							if(this.options.onlyBBmode === false) {
								// wrap attributes
								btnHtml = this.wrapAttrs(btnHtml);
								
								let bel = document.createElement('div');
								bel.appendChild(this.elFromString(btnHtml, document));
								
								let rootSelector = this.filterByNode (bel.children);
								// check if the current rootSelector exists, create unique
								// selector for each transform
								if(rootSelector === 'div' || typeof options.rules[rootSelector] !== 'undefined') {
									if(wbbdebug) {
										console.log(`create unique selector for ${rootSelector}`);
										
										this.setUUID(bel.children);
										
										rootSelector = this.filterByNode(bel.children);
										
										if(wbbdebug) console.log(`New rootSelector ${rootSelector}`);
										
										// replace transforms with unique selector
										let htmlStr2 = this.unwrapAttrs(bel.innerHTML);
										let origBtnHtml = this.unwrapAttrs(btnHtml);
										
										optBtn.transform[htmlStr2] = bbcode;
										delete optBtn.transform[origBtnHtml];
										
										btnHtml = htmlStr2;
										origHtml = htmlStr2;
										
										if(!optBtn.excmd) {
											if(!optBtn.rootSelector) {
												optBtn.rootSelector = [];
											}
											optBtn.rootSelector.push(rootSelector);
										}
										
										// check for rules on this rootSelector
										if(typeof options.rules[rootSelector] === 'undefined') {
											options.rules[rootSelector] = [];
										}
										
										let crules = {};
										if(btnHtml.match(/\{\S+?\}/)) {
											var els = bel.querySelectorAll('*');
											
											for(let el of els) {
												var attrs = this.getAttrList(el);
												
												attrs.forEach(function (item, idx) {
													let attr = el.attributes[item];
													
													if(name.substr(0,1) === '_') {
														name = name.substr(1);
													}
													
													let replaceStrs = attr.match( /\{\S+?\}/g );
													
													if(replaceStrs) {
														for(let a = 0, len = replaceStrs.length; a < len; a++) {
															let replaceName = replaceStrs[a].substr(1, replaceStrs[a].length - 2);
															replaceName = replaceName.replace(this.getValidationRGX(replaceName), '');
															
														}
													}
												});
											}
										}
									}
								}
							}
						}
					}
				}
			} // end btnlist.length loop
		}
		
		_isMobile (str) {
			return  /android|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|meego.+mobile|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i
			.test( str );
		}
		
		getAttrList (element) {
			let arr = [];
			let attrs = element.attributes;
			
			for(let idx = 0, len = attrs.length; idx < len; idx++) {
		    if(attrs[idx].specified) {
		      arr.push(attrs[idx].name);
		    }
		  }
			
			return arr;
		}
		
		
		// TRANSFORM FUNCTIONS
		filterByNode ( node ) {
			var tagName = node.tagName.toLowerCase();
			var filter = tagName;
			var attrs = this.getAttrList( node );
			for(let idx = 0, len = attrs.length; idx < len; idx++) {
				let attr = node.attributes[idx];
				let name = attr.name;
				let value = attr.value;
				
				if(value && !value.match( /\{.*?\}/ )) {
					if(name === 'style') {
						let css = attr.value.split(';');
						
						for(let i = 0, l = css.length; i < l; i++) {
							let cssProp = css[i];
							if(cssProp && cssProp.length > 0) {
								filter += `[${name}*="${cssProp.trim()}"]`;
							}
						}
					}
					else {
						filter += `[${name}=${value}]`;
					}
				}
				else if (value && name === 'style') {
					let posOfBrace = value.indexOf('{');
					let valueSubstr = value.substr(0, posOfBrace);
					
					if(valueSubstr && valueSubstr !== '') {
						value = value.substr(0, posOfBrace);
						let css = value.split(';');
						
						for(let i = 0, l = css.length; i < l; i++) {
							let cssProp = css[i];
							if(cssProp && cssProp.length > 0) {
								filter += `[${name}*="${cssProp}"]`;
							}
						}
					}
				}
				else {
					filter += `[${name}]`;
				}
			}

			// TODO: replace jquery below with native JS
// var idx = $n.parent().children( filter ).index( $n );
// if ( idx > 0 ) {
// filter += ":eq(" + $n.index() + ")";
// }
			
			return filter;
		}
		
		relFilterByNode ( node, stop ) {
			var p = '';
			for(let attrWrap of this.options.attrWrap) {
				stop = stop.replace(`[${attrWrap}`, `[_${attrWrap}`);
			}
			while ( node && node.tagName !== 'BODY' && !this.selectorMatch(node, stop) ) {
				p = `${this.filterByNode(node)} ${p}}`;
				if ( node ) {
					node = node.parentNode;
				}
			}
			return p;
		}
	
		selectorMatch (el, selector) {
		  return (el.matches || el.matchesSelector).call(el, selector);
		}
	}
	
	Wysibb.buttonConfig = {
		bold : {
			title : CURLANG.bold,
			buttonHTML : '<span class="fa fa-bold fa-fw"></span>',
			excmd : 'bold',
			transform : {
				'<strong>{SELTEXT}</strong>' : '[b]{SELTEXT[/b]',
			},
		},
		italic : {
			title : CURLANG.italic,
			buttonHTML : '<span class="fa fa-italic fa-fw"></span>',
			excmd : 'bold',
			transform : {
				'<em>{SELTEXT}</em>' : '[i]{SELTEXT[/i]',
			},
		},
		underline : {
			title : CURLANG.bold,
			buttonHTML : '<span class="fa fa-underline fa-fw"></span>',
			excmd : 'bold',
			transform : {
				'<u>{SELTEXT}</u>' : '[u]{SELTEXT[/u]',
			},
		},
		strike : {
			title : CURLANG.bold,
			buttonHTML : '<span class="fa fa-strikethrough fa-fw"></span>',
			excmd : 'bold',
			transform : {
				'<s>{SELTEXT}</s>' : '[strike]{SELTEXT[/strike]',
			},
		},
		sup : {
			title : CURLANG.sup,
			buttonHTML : '<span class="fa fa-superscript fa-fw"></span>',
			transform: {
				'<sup>{SELTEXT}</sup>' : '[sup]{SELTEXT}[/sup]',
			},
		},
		sub : {
			title : CURLANG.sub,
			buttonHTML : '<span class="fa fa-subscript fa-fw"></span>',
			transform: {
				'<sub>{SELTEXT}</sub>' : '[sub]{SELTEXT}[/sub]',
			},
		},
		link : {
			title : CURLANG.link,
			buttonHTML : 'span class="fa fa-link fa-fw"></span>',
			modal : {
				title : CURLANG.modal_link_title,
				width : '500px',
				tabs : [
	        {
		        input : [
							{
								param : 'SELTEXT',
								title : CURLANG.modal_link_text,
							},
							{
								param: 'URL',
								title : CURLANG.modal_link_url,
								validation : '^https?://',
							},
	          ],
	        },
	      ],
			},
			transform : {
				'<a href="{URL}">{SELTEXT}</a>' : '[url={URL}]{SELTEXT}[/url]',
				'<a href="{URL}">{URL}</a>' : '[url={URL}]{URL}[/url]',
			},
		},
		img : {
			title : CURLANG.img,
			buttonHTML : '<span class="fa fa-image fa-fw"></span>',
			addWrap : true,
			modal : {
				title : CURLANG.modal_img_title,
				width : '600px',
				tabs : [
	        {
					  title : CURLANG.modal_img_tab1,
					  input: [
		          {
								param: 'SRC',
								title: CURLANG.modal_imgsrc_text,
								// by default we check for an actual image file, not an
								// image returned by the server from a URL
								validation : '^http(s)?://.*?\.(jpg|png|gif|jpeg)$',
		          },
						],
					},
				],
				onLoad : this.imgLoadModal,
			},
			transform : {
				'<img src="{SRC}">' : '[img]{SRC}[/img]',
			},
		},
		quote : {
			title : CURLANG.quote,
			buttonHTML : '<span class="fa fa-quote-right fa-fw"></span>',
			transform : {
				'<blockquote>{SELTEXT}</blockquote>' : '[quote]{SELTEXT}[/quote]',
			},
		},
		code : {
			title : CURLANG.code,
			buttonHTML : '<span class="fa fa-code fa-fw"></span>',
			hotkey : 'ctrl+shift+4',
			onlyClearText : true,
			transform : {
				'<code>{SELTEXT}</code>' : '[code]{SELTEXT}[/code]',
			},
		},
		bullist : {
			title : CURLANG.bullist,
			buttonHTML : '<span class="fa fa-list-ul fa-fw"></span>',
			excmd : 'insertUnorderedList',
			transform : {
				'<ul>{SELTEXT}</ul>' : '[list]{SELTEXT}[/list]',
				'<li>{SELTEXT}</li>' : '[*]{SELTEXT}[/*]',
			},
		},
		numlist : {
			title : CURLANG.numlist,
			buttonHTML : '<span class="fa fa-list-ol fa-fw"></span>',
			excmd : 'insertOrderedList',
			transform : {
				'<ol>{SELTEXT}</ol>' : '[list=1]{SELTEXT}[/list]',
				'<li>{SELTEXT}</li>' : '[*]{SELTEXT}[/*]',
			},
		},
		table : {
			type : 'table',
			title : CURLANG.table,
			cols : 10,
			rows : 10,
			cellwidth : 20,
			transform : {
				'<table class="wbb-table">{SELTEXT}</table>' : '[table]{SELTEXT}[/table]',
				'<td>{SELTEXT}</td>' : '[td]{SELTEXT}[/td]',
				'<tr>{SELTEXT}</tr>' : '[tr]{SELTEXT}[/tr]',
			},
			skipRules : true,
		},
		offtop : {
			title : CURLANG.offtop,
			buttonText : 'offtop',
			transform : {
				'<span style="font-size: 10px; color: #CCC">{SELTEXT}</span>' : '[offtop]{SELTEXT}[/offtop]',
			},
		},
		color : {
			type : 'colorpicker',
			title : CURLANG.fontcolor,
			excmd : 'foreColor',
			valueBBname : 'color',
			subInsert : true,
			// we use an array of colors instead of a multi-line string like
			// before
			colors : ['#000000','#444444','#666666','#999999','#b6b6b6','#cccccc','#d8d8d8','#efefef','#f4f4f4','#ffffff','-',
			          '#ff0000','#980000','#ff7700','#ffff00','#00ff00','#00ffff','#1e84cc','#0000ff','#9900ff','#ff00ff','-',
			          '#f4cccc','#dbb0a7','#fce5cd','#fff2cc','#d9ead3','#d0e0e3','#c9daf8','#cfe2f3','#d9d2e9','#ead1dc',
			          '#ea9999','#dd7e6b','#f9cb9c','#ffe599','#b6d7a8','#a2c4c9','#a4c2f4','#9fc5e8','#b4a7d6','#d5a6bd',
			          '#e06666','#cc4125','#f6b26b','#ffd966','#93c47d','#76a5af','#6d9eeb','#6fa8dc','#8e7cc3','#c27ba0',
			          '#cc0000','#a61c00','#e69138','#f1c232','#6aa84f','#45818e','#3c78d8','#3d85c6','#674ea7','#a64d79',
			          '#900000','#85200C','#B45F06','#BF9000','#38761D','#134F5C','#1155Cc','#0B5394','#351C75','#741B47',
			          '#660000','#5B0F00','#783F04','#7F6000','#274E13','#0C343D','#1C4587','#073763','#20124D','#4C1130',
			          ],
	    transform : {
	    	'<span style="color: {COLOR}">{SELTEXT}</font>' : '[color={COLOR}]{SELTEXT}[/color]',
	    },
		},
		size : {
			type : 'select',
			title : CURLANG.fontsize,
			options : ['size_tiny','size_small','size_normal','size_big','size_huge']
		},
		// TODO: HTML button "fa fa-font fa-fw"
		font : {
			type : 'select',
			title : CURLANG.fontfamily,
			excmd : 'fontName',
			valueBBname : 'font',
			options : [
					{
						title : 'Arial',
						exvalue : 'Arial',
					}, {
						title : 'Comic Sans MS',
						exvalue : 'Comic Sans MS',
					}, {
						title : 'Courier New',
						exvalue : 'Courier New',
					}, {
						title : 'Georgia',
						exvalue : 'Georgia',
					}, {
						title : 'Lucida Sans Unicode',
						exvalue : 'Lucida Sans Unicode',
					}, {
						title : 'Tahoma',
						exvalue : 'Tahoma',
					}, {
						title : 'Times New Roman',
						exvalue : 'Times New Roman',
					}, {
						title : 'Trebuchet MS',
						exvalue : 'Trebuchet MS',
					}, {
						title : 'Verdana',
						exvalue : 'Verdana',
					},
			],
			transform : {
				'<span style="font-family: {FONT}">{SELTEXT}</span>' : '[font={FONT}]{SELTEXT}[/font]',
			},
		},
		smilebox : {
			type : 'smilebox',
			title : CURLANG.smilebox,
			buttonHTML : '<span class="fa fa-smile-o fa-fw"></span>',
		},
		alignleft : {
			title : CURLANG.alignleft,
			buttonHTML : '<span class="fa fa-align-left fa-fw"></span>',
			groupkey : 'align',
			transform : {
				'<span style="text-align: left">{SELTEXT}</span>' : '[align=left]{SELTEXT}[/align]',
			},
		},
		aligncenter : {
			title : CURLANG.aligncenter,
			buttonHTML : '<span class="fa fa-align-center fa-fw"></span>',
			groupkey : 'align',
			transform : {
				'<span style="text-align: center">{SELTEXT}</span>' : '[align=center]{SELTEXT}[/align]',
			},
		},
		alignright : {
			title : CURLANG.alignright,
			buttonHTML : '<span class="fa fa-align-right fa-fw"></span>',
			groupkey : 'align',
			transform : {
				'<span style="text-align: right">{SELTEXT}</span>' : '[align=right]{SELTEXT}[/align]',
			},
		},
		video : {
			title : CURLANG.video,
			buttonHTML : '<span class="fa fa-youtube-play fa-fw"></span>',
			modal : {
				title : CURLANG.video,
				width : '600px',
				tabs : [
					{
						title : CURLANG.video,
						input : [
							{
								param : 'SRC',
								title : CURLANG.modal_video_text,
							},
						],
					},
				],
				onSubmit : function ( cmd, opt, queryState ) {
					var url = this.modal.querySelector( 'input[name="SRC"]' ).value.trim();
					
					// find and return the video ID
					var id = url.match(/^.*(?:youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#\&\?]*).*/)[1];
					
					if ( id ) {
						this.insertAtCursor( this.getCodeByCommand( cmd, {
							src : id,
						} ) );
					}
					
					this.closeModal();
					this.updateUI();
					
					return false;
				},
			},
			transform : {
				'<iframe src="http://www.youtube.com/embed/{SRC}" width="640" height="480" frameborder="0"></iframe>' : '[video]{SRC}[/video]',
			},
		},
		removeformat : {
			title : CURLANG.removeFormat,
			buttonHTML : '<span class="fonticon ve-tlb-removeformat1">\uE00f</span>',
			excmd : 'removeFormat',
		},
		
		// select options
		size_tiny : {
			title : CURLANG.size_tiny,
			buttonText : 'fs1',
			excmd : 'fontSize',
			exvalue : '1',
			transform : {
				'<font size="1">{SELTEXT}</font>' : '[size=50]{SELTEXT}[/size]',
			},
		},
		size_small : {
			title : CURLANG.size_small,
			buttonText : 'fs2',
			excmd : 'fontSize',
			exvalue : '2',
			transform : {
				'<font size="2">{SELTEXT}</font>' : '[size=85]{SELTEXT}[/size]',
			},
		},
		size_normal : {
			title : CURLANG.size_normal,
			buttonText : 'fs3',
			excmd : 'fontSize',
			exvalue : '3',
			transform : {
				'<font size="3">{SELTEXT}</font>' : '[size=100]{SELTEXT}[/size]',
			},
		},
		size_big : {
			title : CURLANG.size_big,
			buttonText : 'fs4',
			excmd : 'fontSize',
			exvalue : '4',
			transform : {
				'<font size="4">{SELTEXT}</font>' : '[size=150]{SELTEXT}[/size]',
			},
		},
		size_huge : {
			title : CURLANG.size_huge,
			buttonText : 'fs5',
			excmd : 'fontSize',
			exvalue : '6',
			transform : {
				'<font size="6">{SELTEXT}</font>' : '[size=200]{SELTEXT}[/size]',
			},
		},
	};
	
	/**
	 * Extend object Vanilla JS to jQuery's $.extend()
	 * 
	 * @param {...Object}
	 *          args - objects to be passed
	 * 
	 * NOTE: instead of using the built-in 'arguments' array we use ES2015 rest
	 * parameter for more clarity
	 */
	function extend(...objs) {
		// Variables
		var extended = {};
		var deep = false;
		var i = 0;
		var length = objs.length;
		
		// Check if a deep merge
		if ( Object.prototype.toString.call( objs[0] ) === '[object Boolean]' ) {
		    deep = objs[0];
		    i++;
		}
		
		// Merge the object into the extended object
		var merge = function (obj) {
		    for ( var prop in obj ) {
		        if ( Object.prototype.hasOwnProperty.call( obj, prop ) ) {
		            // If deep merge and property is an object, merge properties
		        	if ( deep && Object.prototype.toString.call(obj[prop]) === '[object Object]' ) {
		                extended[prop] = extend( true, extended[prop], obj[prop] );
		            } else {
		                extended[prop] = obj[prop];
		            }
		        }
		    }
		};
		
		// Loop through each object and conduct a merge
		for ( ; i < length; i++ ) {
		    var obj = objs[i];
		    merge(obj);
		}
		
		return extended;
	}
	
	/**
	 * Get closest DOM element up the tree that contains a class, ID, or data
	 * attribute
	 * 
	 * @param {Node}
	 *          elem The base element
	 * @param {String}
	 *          selector The class, id, data attribute, or tag to look for
	 * @return {Node} Null if no match
	 */
	function getClosest (elem, selector) {
	    var firstChar = selector.charAt(0);

	    // Get closest match
	    for ( ; elem && elem !== document; elem = elem.parentNode ) {

	        // If selector is a class
	        if ( firstChar === '.' ) {
	            if ( elem.classList.contains( selector.substr(1) ) ) {
	                return elem;
	            }
	        }

	        // If selector is an ID
	        if ( firstChar === '#' ) {
	            if ( elem.id === selector.substr(1) ) {
	                return elem;
	            }
	        } 

	        // If selector is a data attribute
	        if ( firstChar === '[' ) {
	            if ( elem.hasAttribute( selector.substr(1, selector.length - 2) ) ) {
	                return elem;
	            }
	        }

	        // If selector is a tag
	        if ( elem.tagName.toLowerCase() === selector ) {
	            return elem;
	        }
	    }

	    return false;
	};

	function matches (elm, selector) {
		var matches = (elm.document || elm.ownerDocument).querySelectorAll(selector),
		i = matches.length;
		while (--i >= 0 && matches.item(i) !== elm) {
			continue;
		}
		return i > -1;
	}
	
	window.wysibb = Wysibb;
}();

