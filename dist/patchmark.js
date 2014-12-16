/*! patchmark - v0.1.0 - 2014-12-15
* https://github.com/hidcliff/patchmark.js
* Copyright (c) 2014 ; Licensed  */
;(function() {
	"use strict";

	var PatchMark = {},
		storedLinks = {},
		blockTokens = [],
		bListParagraph = false,
		patterns = {
			/**
			 * inline patterns
			 */
			spans : {
				strong : {
					pattern : /(?:^|([^\\]))([*_])\2([\s\S]+?)\2\2/g,
					func: function(m, backslash, indicator, text) {
						var ret = [];
						if (backslash && backslash.search(/\\/) < 0) {
							ret.push(backslash);
						}
						ret.push("<strong>" + text + "</strong>");
						return ret.join("");
					}
				},
				emphasize : {
					pattern : /(?:^|([^\\]))([*_])([\s\S]+?)\2/g,
					func: function(m, backslash, indicator, text) {
						var ret = [];
						if (backslash && backslash.search(/\\/) < 0) {
							ret.push(backslash);
						}
						ret.push("<em>" + text + "</em>");
						return ret.join("");
					}
				},
				code : {
					pattern : /(`+)([\s\S]+?)\1(?!`)/g,
					func : function(m, indicator, code) {
						return "<code>" + parser.escapeHTML(parser.strip(code)) + "</code>";
					}
				},
				link : {
					pattern : /(!?)\[((?:\[[^\[\]]*\]|[^\[\]])+)\]\([ \t]*([^\)]+?)[ \t]*(?:(['"])([\s\S]+?)\4[ /t]*)?\)/g,
					func : function(m, image, text, link, mark, title) {
						text = parser.parseSpanRules(text);

						if (image) {
							return '<img src="' + link + '" alt="' + text + '"' + (title ? ' title="' + title + '"' : '') + ' />';
						} else {
							return '<a href="' + link + '"' + (title ? ' title="' + title + '"' : '') + '>' + text + '</a>';
						}
					}
				},
				referenceLink : {
					pattern : /(!?)\[([^\[\]]+)\](?:[ \t]*\[([^\[\]]*)\])?/g,
					func : function(m, image, text, id) {
						var link = storedLinks[(id || text).toLowerCase()];

						if (link) {
							if (image.search(/!/) > -1) {
								return '<img src="' + link.link + '" alt="' + text + '"' + (link.title ? ' title="' + link.title + '"' : '') + ' />';
							} else {
								return '<a href="' + link.link + '"' + (link.title ? ' title="' + link.title + '"' : '') + '>' + text + '</a>';
							}
						}
						return m;
					}
				},
				automaticLink : {
					pattern : /<((https?|ftp):[^>]+)>/g,
					func : function(m, link) {
						return '<a href="' + link + '">' + link + '</a>';
					}
				},
				email : {
					pattern : /<((mailto:)?(.+?\@[-.a-zA-Z0-9]+?\.[a-zA-Z]+))>/g,
					func : function(m, m2, protocol, addr) {
						return '<a href="' + parser.toHexString('mailto:' + addr) + '">' + parser.toHexString(addr) + '</a>';
					}
				},
				backslash : {
					pattern : /\\([\\`*_{}\[\]()#+-.!])/g,
					func : function(m, char) {
						return char;
					}
				}
			},

			/**
			 * block patterns
			 */
			blocks: {
				atxHeader : {
					pattern : /^[ ]{0,3}(.+)[ \t]*\n([=-])\2\2+[ \t]*$/gm,
					func: function(m, text, indicator) {
						if (indicator === "=") {
							return "<h1>" + text + "</h1>\n";
						}
						return "<h2>" + text + "</h2>\n";
					}
				},
				setextHeader : {
					pattern : /^[ ]{0,3}(#{1,6})[ \t]*(.+?)[ \t]*#*$/gm,
					func: function(m, indicator, text) {
						var level = indicator.length;
						return "<h"  + level + ">" + text + "</h" + level + ">\n";
					}
				},
				code : {
					pattern : /(\n\n)^(([ ]{4}|\t).*\n*)+(?=\S|$)/gm,
					func: function(m, spaces) {
						var html = m;

						html = parser.detachTab(html);
						html = parser.escapeTab(html);
						html = parser.escapeHTML(html);
						html = parser.strip(html);

						return spaces + parser.encodeBlock("<pre><code>" + html + "\n</code></pre>") + "\n";
					}
				},
				fencedCode : {
					pattern: /^[ ]*(`{3,})[ ]*(.+)?[ ]*\n([\s\S]+?)\1(?=\n|$)/gm,
					func: function(m, indicator, language, code) {
						var html = code;

						html = parser.escapeTab(html);
						html = parser.escapeHTML(html);
						html = parser.strip(html);

						return parser.encodeBlock("<pre><code>" + html + "\n</code></pre>") + "\n";
					}
				},
				blockquote : {
					pattern : /(^[ ]{0,3}>([ ]{0,4}|\t).+\n(.+\n)*\n*)+/gm,
					func : function(m) {
						var html = m;

						html = parser.detachQuote(html);
						html = parser.parse(html);
						html = parser.rstrip(html);

						return parser.encodeBlock("<blockquote>\n" + html + "\n</blockquote>") + "\n\n";
					}
				},

				paragraph : {
					pattern: /\n{2,}/g,
					func : function(m) {
						var html = m;
						if (html.search(/\S/) < 0) {
							return "";
						}
						if (html.search(/^\|\|PMB\d+PMB\|\|/) > -1) {
							return html;
						}
						if (html.search(/^[ ]{0,3}<(h\d|div|blockquote|pre|ul|ol)>[\s\S]+?(<\/\1>)?/) > -1) {
							return html;
						}
						if (html.search(/^[ ]{0,3}<hr \/>/) > -1) {
							return html;
						}

						html = parser.replace("lineBreak", html);
						html = parser.strip(html);

						return "<p>" + html + "</p>";
					}
				},

				list : {
					pattern : /(?:\n\n)((^[ ]*)([*+-]|\d+\.)[ \t][\s\S]+?\n{2,}(?!(([*+-]|\d+\.)[ \t]|([ ]{4}|\t)).))/gm,
					func : function(m, body, space, indicator) {
						var html = body,
							tag = indicator.search(/[*+-]/g) > -1 ? "ul" : "ol";

						bListParagraph = false;

						html = parser.replace("listItem", html + "\n\n\n");
						html = parser.rstrip(html);

						return "<" + tag + ">\n" + html + "\n</" + tag + ">\n\n";
					}
				},

				subList : {
					pattern : /((^[ ]*)([*+-]|\d+\.)[ \t][\s\S]+?\n{2,}(?!(([*+-]|\d+\.)[ \t]|([ ]{4}|\t)).))/gm,
					func : function(m, indicator) {
						var html = m,
							tag = indicator.search(/[*+-]/g) > -1 ? "ul" : "ol";

						html = parser.replace("listItem", html);
						html = parser.rstrip(html);

						return "<" + tag + ">\n" + html + "\n</" + tag + ">\n";
					}
				},

				listItem : {
					pattern : /^[ ]*([*+-]|\d+\.)[ \t]([\s\S]+?\n{1,2})(?=\n*(?:[ ]{0,3}([*+-]|\d+\.)[ \t])|(?:\n\n\s*$))/gm,
					func : function(m, indicator, text, nextItem) {
						var html = text;
						var bExistParagraph = (html.search(/\n{2,}./) > -1) || (nextItem && html.search(/\n{2,}$/) > -1);

						html = parser.detachFirstSpaces(html);
						html = parser.replace("subList", html + "\n\n");
						html = parser.rstrip(html);
						html = parser.parseListItem(html);

						if (bExistParagraph || bListParagraph) {
							html = parser.paragraph(html);
						} else {
							html = parser.parseSpanRules(html);
						}

						bListParagraph = bExistParagraph;

						return "<li>" + html + "</li>\n";
					}
				},

				horizon : {
					pattern : /^[ ]{0,3}(\*|-)[ ]*\1[ ]*\1.*$/gm,
					func : "<hr />\n"
				},

				lineBreak : {
					pattern : /([ ]{2,}|\t)\n/g,
					func : "<br />\n"
				},

				references : {
					pattern : /^[ ]{0,3}\[([^\[\]]+)\]:[ \t]*([\S]+)(?:[ \t]*(?:\"([^\"]+)\"|'([^\']+)'|\(([^\)]+)\)))?/gm,
					func : function(m, id, link, title0, title1, title2) {
						storedLinks[id.toLowerCase()] = {
							link : link,
							title : title0 || title1 || title2
						};
						return "";
					}
				}
			}
		},

		/**
		 * Markdown Parser Object
		 * @type {{_getRule: Function, _replace: Function, escapeHTML: Function, escapeTab: Function, detachFirstSpaces: Function, detachTab: Function, detachQuote: Function, strip: Function, lstrip: Function, rstrip: Function, encodeBlock: Function, decodeBlocks: Function, replace: Function, standardizeNewline: Function, parseSpanRules: Function, paragraph: Function, _addTemporaryNewline: Function, _removeTemporaryNewline: Function, parse: Function}}
		 */
		parser = {
			/**
			 * Get rule
			 * @param key
			 * @param bSpan
			 * @returns {*}
			 * @private
			 */
			_getRule : function(key, bSpan) {
				return patterns[!bSpan ? "blocks" : "spans"][key];
			},

			/**
			 * Replace input by rule
			 * @param input
			 * @param rule
			 * @returns {*}
			 * @private
			 */
			_replace : function(input, rule) {
				if (!rule) {
					return input;
				}

				if (rule instanceof Array) {
					for (var i=0; i<rule.length; i++) {
						input = this._replace(input, rule[i]);
					}
					return input;
				} else {
					return input.replace(rule.pattern, rule.func);
				}
			},

			/**
			 * Escape tags
			 * @param input
			 * @returns {*}
			 */
			escapeHTML : function(input) {
				input = this._replace(input, {pattern: /&/g, func: "&amp;"});
				input = this._replace(input, {pattern: /</g, func: "&lt;"});
				input = this._replace(input, {pattern: />/g, func: "&gt;"});
				input = this._replace(input, {pattern: /"/g, func: "&quot;"});
				return  this._replace(input, {pattern: /'/g, func: "&#39;"});
			},

			/**
			 * Convert tab to four spaces
			 * @param input
			 * @returns {*}
			 */
			escapeTab : function(input) {
				return this._replace(input, {pattern: /\t/g, func: "    "});
			},

			/**
			 * Remove first spaces
			 * @param input
			 * @returns {*}
			 */
			detachFirstSpaces : function(input) {
				return this._replace(input, {pattern: /^([ ]{1,4}|\t)/gm, func: ""});
			},

			/**
			 * Remove first tabs
			 * @param input
			 * @returns {*}
			 */
			detachTab : function(input) {
				return this._replace(input, {pattern: /^([ ]{4}|\t)/gm, func: ""});
			},

			/**
			 * Remove quote indicator(>)
			 * @param input
			 * @returns {*}
			 */
			detachQuote : function(input) {
				return this._replace(input, {pattern: /^[ ]{0,3}>[ \t]?/gm, func: ""});
			},

			/**
			 * Convert string to Hex
			 * @param input
			 * @returns {string}
			 */
			toHexString : function(input) {
				var hex = [];
				for (var i = 0, len = input.length; i < len; i++) {
					hex.push("&#x" + input.charCodeAt(i).toString(16) + ";");
				}
				return hex.join("");
			},

			/**
			 * Remove spaces on the left and right side
			 * @param input
			 * @returns {*}
			 */
			strip : function(input) {
				return this.rstrip(this.lstrip(input));
			},

			/**
			 * Remove spaces on the left side
			 * @param input
			 * @returns {*}
			 */
			lstrip : function(input) {
				return this._replace(input, {pattern: /^\s+/g, func: ""});
			},

			/**
			 * Remove spaces on the right side
			 * @param input
			 * @returns {*}
			 */
			rstrip : function(input) {
				return this._replace(input, {pattern: /\s+$/g, func: ""});
			},

			/**
			 * Encode blocks
			 * @param input
			 * @returns {string}
			 */
			encodeBlock : function(input) {
				//console.log(blockTokens);
				return "||PMB" + (blockTokens.push(input) - 1) + "PMB||";
			},

			/**
			 * Decode blocks
			 * @param input
			 * @returns {*}
			 */
			decodeBlocks : function(input) {
				return this.strip(this._replace(input, {pattern: /(\|\|)PMB(\d+)PMB\1/g, func : function(m, indicator, index) {
					return blockTokens[index];
				}}));
			},

			/**
			 * Replace
			 * @param key
			 * @param input
			 * @returns {*}
			 */
			replace : function(key, input) {
				return this._replace(input, this._getRule(key));
			},

			/**
			 * Standardize new line. windows or old mac to unix
			 * @param input
			 * @returns {*}
			 */
			standardizeNewline : function(input) {
				input = this._replace(input, {pattern: /\r\n/g, func: "\n"});
				input = this._replace(input, {pattern: /\r/g, func: "\n"});
				return input;
			},

			/**
			 * Apply span rules
			 * @param input
			 * @returns {*}
			 */
			parseSpanRules : function(input) {
				var rules = patterns.spans;
				for (var rule in rules) {
					input = this._replace(input, rules[rule]);
				}

				return input;
			},

			/**
			 * Separate between paragraphs and apply span rules
			 * @param input
			 * @returns {string}
			 */
			paragraph : function(input) {
				var rule = this._getRule("paragraph"),
					tokens = input.split(rule.pattern),
					ps = [];

				for (var prop in tokens) {
					ps.push(rule.func(this.parseSpanRules(this.strip(tokens[prop]))));
				}

				return ps.join("\n");
			},

			/**
			 * Add temporary new line before parsing
			 * @param input
			 * @returns {string}
			 * @private
			 */
			_addTemporaryNewline : function(input) {
				return "\n\n" + input + "\n\n";
			},

			/**
			 * Remove temporary new line after parsing
			 * @param input
			 * @returns {*}
			 * @private
			 */
			_removeTemporaryNewline : function(input) {
				return this._replace(input, [{pattern: /^\n\n/, func: ""}, {pattern: /([\s\S]+)\n\n$(?![\s\S])/, func: "$1"}]);
			},

			/**
			 * Parse markdown in ListItems
			 * @param input
			 * @returns {*}
			 */
			parseListItem : function(input) {
				var html = this._addTemporaryNewline(input);

				html = this.replace("blockquote", html);
				html = this.replace("atxHeader", html);
				html = this.replace("setextHeader", html);
				html = this.replace("horizon", html);
				html = this.replace("fencedCode", html);
				html = this.replace("code", html);
				html = this.decodeBlocks(html);
				html = this._removeTemporaryNewline(html);

				return html;
			},

			/**
			 * Parse markdown, and convert it to HTML
			 * @param input
			 * @returns {*}
			 */
			parse : function(input) {
				var html = this._addTemporaryNewline(input);
				html = this.standardizeNewline(html);
				html = this.replace("references", html);
				html = this.replace("blockquote", html);
				html = this.replace("atxHeader", html);
				html = this.replace("setextHeader", html);
				html = this.replace("horizon", html);
				html = this.replace("list", html);
				html = this.replace("fencedCode", html);
				html = this.replace("code", html);
				html = this.paragraph(html);
				html = this.decodeBlocks(html);

				html = this._removeTemporaryNewline(html);

				//init blockTokens object
				blockTokens = [];

				return html;
			}
		};


	/**
	 * Convert markdown to HTML
	 * @param input
	 * @returns {*}
	 */
	PatchMark.parse = function(input) {
		return parser.parse(input);
	};


	if (typeof module !== 'undefined' && typeof exports === 'object') {
		module.exports = PatchMark;
	} else {
		window.patchmark = PatchMark;
	}
}());
