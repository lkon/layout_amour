/**
 * @fileOverview сценарий обрабатывает неуспешную загрузку изображений 
 * 				с сервера, предоставление интерфейса аутентификации, 
 * 				работу слайдшоу, представление документа в IE7
 * @author <a href="http://elkonina.ru/">Конина Елена</a>
 */
(function () {
	/**
	 * Объект имеет метод загрузки сценария из внешнего источника
	 * и свойство, где сохранен адрес библиотеки jQuery последней версии
	 * на хосте googleapis.com 
	 * @type { {init:function, jQ: String} }
	 */
	var	loadingScriptOut = {	
		/**
		 * @author <a href=' http://stevesouders.com/efws/script-onload.php'>Стив Соудерс</a>
		 * @param {String} src - адрес скрипта, который должен быть загружен
		 * @param {Function} callback - функция будет вызвана после успешной загрузки внешнего скрипта
		 * @param {Element} appendTo - html-элемент, куда будет загружен внешний скрипт, default: head.
		 */
		init : function(src, callback, appendTo) {
			/**
			 * сценарий, загружаемый на страницу из внешнего источника
			 * @type {Element} 
			 */
			var script = document.createElement("script");

			if (script.readyState && !script.onload) {
				script.onreadystatechange = function() {
					if ((script.readyState === 'loaded' || script.readyState === "complete")
						&& !script.onloadDone) {
						script.onloadDone = true;
						callback();
					}
				};
			} else {
				script.onload = function() {
					if (!script.onloadDone) {
						script.onloadDone = true;
						callback();
					}
				};
			}
			script.type = 'text/javascript';
			script.src = src;
			if (!appendTo) {
				appendTo = document.documentElement.children[0];
			}
			appendTo.appendChild(script);
		},
		jQ : "https://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js"
	};
	
	window.onload = function () {
		loadingScriptOut.init(loadingScriptOut.jQ, function () {
			if($ && typeof $ === 'function'){
			//при нажатии на кнопку вход сплывает окно аутентификации
				$(".auth_start").click(function () {
					var authSet = $('.auth_set');
					authSet.css({
						"display":'block',
						"top" : ( document.documentElement.clientHeight/2 - authSet.height() ) < 0 ? 0 : ( document.documentElement.clientHeight/2 - authSet.height() ) + 'px'
					})
				});
				//при нажатии на крестик окна аутентификации - окно закрывается
				$(".auth_fine").click(function () {
					$('.auth_set').css("display",'none');
				});		
				(function(){
					//общая обработка скругления углов изображений для слайдшоу,
					//хотя в последних версиях IE, FF поддерживается border-radius
					//контейнеров, содержащих изображения
					if ( $.browser.msie && parseInt($.browser.version, 10) === 9) return;
					else if ($.browser.mozilla && parseInt($.browser.version.slice(0,2), 10) > 1 ) return;
					else{			 	
						$(".slideshow_content img").each(function () {
							var cnt = $(this); 
							cnt.css('opacity', 0).parent().css({
																"backgroundImage": 'url("' + cnt.get(0).src + '")',
																'borderRadius' : "16px"
															})
						});
					 }
				}());		
				//слайдшоу
				$('.slideshow_tabs').bind("click",function (/* Event*/ e) {
					//for agents supported Transition
					if ( (window.getComputedStyle &&
								(getComputedStyle(document.body, null)['webkitTransitionProperty']
								|| getComputedStyle(document.body, null)["MozTransitionProperty"]
								|| getComputedStyle(document.body, null)['OTransitionProperty']))
							|| 		
							(document.body.currentStyle 
							&& document.body.currentStyle["msTransitionProperty"])) 
						{
							$('.slideshow_content').css({
														'left' : "-"+ 730*( $(e.target).text() - 1) +'px'
													})
						} else {					
						//for agents don't supported Transition
							$(".slideshow_content").animate(
														{'left' : "-"+ 730*( $(e.target).text() - 1) +'px'},
														2000
													)
						}
				});		
				//при ошибке в процессе загрузки изображения с сервера убирается специфический крестик браузера
				$("img").each(function () {
					var cnt = $(this).get(0);
					$.ajax({
						url : cnt.src,
						type : 'HEAD',
						async : false,
						error : function () {
							$(cnt).css("display",'none')			
						}
					});
				});
				//доработка IE7
				if ($('html').hasClass("ie7")) {
					(function($) {
						/**
						 * Фальшивая генерация контента - функция вставляет в элемент -
						 * родитель div с заданным классом(описанным в css) в позицию
						 * afterBegin или beforeEnd.
						 * 
						 * @param {String}
						 *            pos - внутри родительского элемента вначале
						 *            afterBegin или внутри родительского элемента в
						 *            конец beforeEnd.
						 * @param {String}
						 *            cls - класс вставляемого div.
						 * @return {jQuery} обернутый набор
						 */
						$.fn.fakeGenerated = function(pos, cls) {
							return this.each(function() {
										/**
										 * HTMLElement обернутого набора
										 * 
										 * @type {Element}
										 */
										var el = this;
										el.insertAdjacentHTML(pos, '<div></div>');
										switch (pos) {
											case "afterBegin" :
												$($(el).children().get(0))
														.addClass(cls);
												break;
											case 'beforeEnd' :
												$($(el).children().get(-1))
														.addClass(cls);
												break;
										}
									})
						};
					}(jQuery));
					
					//для добавления фона рисунку шапки страницы
					$("body").fakeGenerated('afterBegin', "body-before");
					//для добавления фона рисунку подвала страницы
					$('.body_wrap-in').fakeGenerated("afterBegin", 'body_wrapin-before');
					//для добавления изображения ангела слева в подвале
					$(".vcard").fakeGenerated("afterBegin", "vcard-before");
				}
			}
		})	
	};
}());