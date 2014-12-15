/* global describe, it, expect, patchmark */

(function() {
	'use strict';

	describe('Patchmark Parser', function () {

		describe('Block Elements', function () {
			it('parse(input) should translate paragraph into <p>input</p> tag', function () {
				var input = ([
					'this is the first paragraph.',
					'',
					'this is the second paragraph.',
					'this is the second paragraph.'
				]).join('\n');
				var output = ([
					'<p>this is the first paragraph.</p>',
					'<p>this is the second paragraph.',
					'this is the second paragraph.</p>'
				]).join('\n');
				expect(patchmark.parse(input)).to.equal(output);
			});

			it('parse(input) should translate linkbreak into <br /> tag', function () {
				var input = ([
					'this is the first paragraph.',
					'',
					'this is the second paragraph.  ',
					'this is the second paragraph.'
				]).join('\n');
				var output = ([
					'<p>this is the first paragraph.</p>',
					'<p>this is the second paragraph.<br />',
					'this is the second paragraph.</p>'
				]).join('\n');
				expect(patchmark.parse(input)).to.equal(output);
			});

			it('parse(input) should translate atxHeader into <h1></h1> or <h2></h2> tag', function () {
				var input = ([
					'This is on H1',
					'============='
				]).join('\n');
				expect(patchmark.parse(input)).to.equal('<h1>This is on H1</h1>');
				expect(patchmark.parse('Header1\n==')).to.not.equal('<h1>This is on H1</h1>');

				input = ([
					'This is on H2',
					'-------------'
				]).join('\n');
				expect(patchmark.parse(input)).to.equal('<h2>This is on H2</h2>');
				expect(patchmark.parse('Header2\n--')).to.not.equal('<h2>This is on H2</h2>');
			});

			it('parse(input) should translate setextHeader into <h1></h1> or <h6></h6> tag', function () {
				expect(patchmark.parse('# This is on H1')).to.equal('<h1>This is on H1</h1>');
				expect(patchmark.parse('# This is on H1 ### 1234')).to.equal('<h1>This is on H1 ### 1234</h1>');
				expect(patchmark.parse('# This is on H1')).to.equal('<h1>This is on H1</h1>');
				expect(patchmark.parse('#This is on H1')).to.equal('<h1>This is on H1</h1>');

				expect(patchmark.parse('## This is on H2')).to.equal('<h2>This is on H2</h2>');
				expect(patchmark.parse('### This is on H3')).to.equal('<h3>This is on H3</h3>');
				expect(patchmark.parse('#### This is on H4')).to.equal('<h4>This is on H4</h4>');
				expect(patchmark.parse('##### This is on H5')).to.equal('<h5>This is on H5</h5>');
				expect(patchmark.parse('###### This is on H6')).to.equal('<h6>This is on H6</h6>');
			});

			it('parse(input) should translate blockquotes into <blockquote></blockquote> tag', function () {
				var input = ([
					'> This is the first paragraph of this blockquote.',
					'>',
					'> This is the second paragraph of this blockquote.'
				]).join('\n');
				var output = ([
					'<blockquote>',
					'<p>This is the first paragraph of this blockquote.</p>',
					'<p>This is the second paragraph of this blockquote.</p>',
					'</blockquote>'
				]).join('\n');
				expect(patchmark.parse(input)).to.equal(output);

				input = ([
					'> This is the first paragraph of this blockquote.',
					'',
					'> This is the second paragraph of this blockquote.'
				]).join('\n');
				expect(patchmark.parse(input)).to.equal(output);


				input = ([
					'> This is the first level of quoting.',
					'>',
					'> > This is nested blockquote.',
					'>',
					'> Back to the first level.'
				]).join('\n');
				output = ([
					'<blockquote>',
						'<p>This is the first level of quoting.</p>',
						'<blockquote>',
							'<p>This is nested blockquote.</p>',
						'</blockquote>',
						'<p>Back to the first level.</p>',
					'</blockquote>'
				]).join('\n');
				expect(patchmark.parse(input)).to.equal(output);

				input = ([
					'>     return shell_exec("echo $input | $markdown_script");'
				]).join('\n');
				output = ([
					'<blockquote>',
					'<pre><code>return shell_exec(&quot;echo $input | $markdown_script&quot;);',
					'</code></pre>',
					'</blockquote>'
				]).join('\n');
				expect(patchmark.parse(input)).to.equal(output);

				input = ([
					'> ## This is a header.',
					'>',
					'> 1.   This is the first list item.',
					'> 2.   This is the second list item.',
					'>',
					'> Here\'s some example code:',
					'>',
					'>     return shell_exec("echo $input | $markdown_script");'
				]).join('\n');
				output = ([
					'<blockquote>',
						'<h2>This is a header.</h2>',
						'<ol>',
							'<li>This is the first list item.</li>',
							'<li>This is the second list item.</li>',
						'</ol>',
						'<p>Here\'s some example code:</p>',
					'<pre><code>return shell_exec(&quot;echo $input | $markdown_script&quot;);',
					'</code></pre>',
					'</blockquote>'
				]).join('\n');
				expect(patchmark.parse(input)).to.equal(output);

				/*
				var input = '> this is a blockquote.\nthis is a blockquote.\n> this is a blockquote.';
				var output = '<blockquote>\n<p>this is a blockquote.\nthis is a blockquote.\nthis is a blockquote.</p>\n</blockquote>';
				expect(patchmark.parse(input)).to.equal(output);
				*/
			});

			it ('parse(input) should translate list into <ul></ul> or <ol></ol> tag', function() {
				var input = ([
					'* Red',
					'* Green',
					'* Blue'
				]).join('\n');
				var output = ([
					'<ul>',
					'<li>Red</li>',
					'<li>Green</li>',
					'<li>Blue</li>',
					'</ul>'
				]).join('\n');
				expect(patchmark.parse(input)).to.equal(output);

				input = ([
					'+ Red',
					'+ Green',
					'+ Blue'
				]).join('\n');
				expect(patchmark.parse(input)).to.equal(output);

				input = ([
					'- Red',
					'- Green',
					'- Blue'
				]).join('\n');
				expect(patchmark.parse(input)).to.equal(output);

				input = ([
					'* Red',
					'',
					'* Green',
					'* Blue'
				]).join('\n');
				output = ([
					'<ul>',
					'<li><p>Red</p></li>',
					'<li><p>Green</p></li>',
					'<li>Blue</li>',
					'</ul>'
				]).join('\n');
				expect(patchmark.parse(input)).to.equal(output);

				input = ([
					'1. Bird',
					'2. McHale',
					'3. Parish'
				]).join('\n');
				output = ([
					'<ol>',
					'<li>Bird</li>',
					'<li>McHale</li>',
					'<li>Parish</li>',
					'</ol>'
				]).join('\n');
				expect(patchmark.parse(input)).to.equal(output);

				input = ([
					'1. Bird',
					'1. McHale',
					'1. Parish'
				]).join('\n');
				expect(patchmark.parse(input)).to.equal(output);

				input = ([
					'3. Bird',
					'1. McHale',
					'8. Parish'
				]).join('\n');
				expect(patchmark.parse(input)).to.equal(output);


				input = ([
					'*   Lorem ipsum dolor sit amet, consectetuer adipiscing elit.',
					'	Aliquam hendrerit mi posuere lectus. Vestibulum enim wisi,',
					'	viverra nec, fringilla in, laoreet vitae, risus.',
					'*   Donec sit amet nisl. Aliquam semper ipsum sit amet velit.',
					'	Suspendisse id sem consectetuer libero luctus adipiscing.'
				]).join('\n');
				output = ([
					'<ul>',
					'<li>Lorem ipsum dolor sit amet, consectetuer adipiscing elit.',
					'Aliquam hendrerit mi posuere lectus. Vestibulum enim wisi,',
					'viverra nec, fringilla in, laoreet vitae, risus.</li>',
					'<li>Donec sit amet nisl. Aliquam semper ipsum sit amet velit.',
					'Suspendisse id sem consectetuer libero luctus adipiscing.</li>',
					'</ul>'
				]).join('\n');
				expect(patchmark.parse(input)).to.equal(output);

				input = ([
					'1.  This is a list item with two paragraphs. Lorem ipsum dolor',
					'	sit amet, consectetuer adipiscing elit. Aliquam hendrerit',
					'	mi posuere lectus.',
					'',
					'	Vestibulum enim wisi, viverra nec, fringilla in, laoreet',
					'	vitae, risus. Donec sit amet nisl. Aliquam semper ipsum',
					'	sit amet velit.',
					'',
					'2.  Suspendisse id sem consectetuer libero luctus adipiscing.',
					'3.  Suspendisse id sem consectetuer libero luctus adipiscing.'
				]).join('\n');
				output = ([
					'<ol>',
					'<li><p>This is a list item with two paragraphs. Lorem ipsum dolor',
					'sit amet, consectetuer adipiscing elit. Aliquam hendrerit',
					'mi posuere lectus.</p>',
					'<p>Vestibulum enim wisi, viverra nec, fringilla in, laoreet',
					'vitae, risus. Donec sit amet nisl. Aliquam semper ipsum',
					'sit amet velit.</p></li>',
					'<li><p>Suspendisse id sem consectetuer libero luctus adipiscing.</p></li>',
					'<li>Suspendisse id sem consectetuer libero luctus adipiscing.</li>',
					'</ol>'
				]).join('\n');
				expect(patchmark.parse(input)).to.equal(output);






				input = ([
					'*   A list item with a blockquote:',
					'> This is a blockquote'
				]).join('\n');
				output = ([
					'<ul>',
					'<li>A list item with a blockquote:',
					'<blockquote>',
					'<p>This is a blockquote</p>',
					'</blockquote></li>',
					'</ul>'
				]).join('\n');
				expect(patchmark.parse(input)).to.equal(output);

				input = ([
					'*   A list item with a blockquote:',
					'',
					'	> This is a blockquote'
				]).join('\n');
				output = ([
					'<ul>',
					'<li><p>A list item with a blockquote:</p>',
					'<blockquote>',
					'<p>This is a blockquote</p>',
					'</blockquote></li>',
					'</ul>'
				]).join('\n');
				expect(patchmark.parse(input)).to.equal(output);



				input = ([
					'*   A list item with a blockquote:',
					'> This is a blockquote',
					'> inside a listitem'
				]).join('\n');
				output = ([
					'<ul>',
					'<li>A list item with a blockquote:',
					'<blockquote>',
					'<p>This is a blockquote',
					'inside a listitem</p>',
					'</blockquote></li>',
					'</ul>'
				]).join('\n');
				expect(patchmark.parse(input)).to.equal(output);

				input = ([
					'*   A list item with a blockquote:',
					'',
					'	> This is a blockquote',
					'	> inside a listitem'
				]).join('\n');
				output = ([
					'<ul>',
					'<li><p>A list item with a blockquote:</p>',
					'<blockquote>',
					'<p>This is a blockquote',
					'inside a listitem</p>',
					'</blockquote></li>',
					'</ul>'
				]).join('\n');
				expect(patchmark.parse(input)).to.equal(output);


				input = ([
					'*   A list item with a code block:',
					'',
					'		<code goes here>'
				]).join('\n');
				output = ([
					'<ul>',
					'<li><p>A list item with a code block:</p>',
					'<pre><code>&lt;code goes here&gt;',
					'</code></pre></li>',
					'</ul>'
				]).join('\n');
				expect(patchmark.parse(input)).to.equal(output);


				input = ([
					'1986\\. What a great season.'
				]).join('\n');
				output = ([
					'<p>1986. What a great season.</p>'
				]).join('\n');
				expect(patchmark.parse(input)).to.equal(output);



				input = '- list1\n- list2';
				output = '<ul>\n<li>list1</li>\n<li>list2</li>\n</ul>';
				expect(patchmark.parse(input)).to.equal(output);

				input = '- list1\n    1. sublist1\n    2. sublist2\n- list2';
				output = '<ul>\n<li>list1\n<ol>\n<li>sublist1</li>\n<li>sublist2</li>\n</ol></li>\n<li>list2</li>\n</ul>';
				expect(patchmark.parse(input)).to.equal(output);
			});


			it ('parse(input) should translate fencedBlock into <pre><code></code></pre> tag', function() {
				var code = ([
					'function() {',
					'	var sum=0;',
					'	for() {',
					'		sum = sum + 1;',
					'	}',
					'	return sum;',
					'}'
				]).join('\n');
				var input = ([
					'```',
					code,
					'```'
				]).join('\n');
				var output = ([
					'<pre><code>' + code.replace(/\t/g, '    '),
					'</code></pre>'
				]).join('\n');
				expect(patchmark.parse(input)).to.equal(output);
			});

			it ('parse(input) should translate blockCode into <pre><code></code></pre> tag', function() {
				var input = ([
					'This is a normal paragraph:',
					'',
					'	This is a code block.'
				]).join('\n');
				var output = ([
					'<p>This is a normal paragraph:</p>',
					'<pre><code>This is a code block.',
					'</code></pre>'
				]).join('\n');
				expect(patchmark.parse(input)).to.equal(output);

				input = ([
					'Here is an example of JavaScript:',
					'',
					'	for() {',
					'		sum = sum + 1;',
					'	}',
					'	return sum;'
				]).join('\n');
				output = ([
					'<p>Here is an example of JavaScript:</p>',
					'<pre><code>for() {',
					'    sum = sum + 1;',
					'}',
					'return sum;',
					'</code></pre>'
				]).join('\n');
				expect(patchmark.parse(input)).to.equal(output);

				input = ([
					'	<div class="footer">',
					'		&copy; 2004 Foo Corporation',
					'	</div>'
				]).join('\n');
				output = ([
					'<pre><code>&lt;div class=&quot;footer&quot;&gt;',
					'    &amp;copy; 2004 Foo Corporation',
					'&lt;/div&gt;',
					'</code></pre>'
				]).join('\n');
				expect(patchmark.parse(input)).to.equal(output);



				var code = 'function() {\n    var sum=0;\n    for() {\n        sum = sum + 1;\n    }\n    return sum;\n}';
				input = '    ' + code.replace(/\n/g, '\n    ');
				output = '<pre><code>' + code + '\n</code></pre>';
				expect(patchmark.parse(input)).to.equal(output);

				code = '<div>\n    <div>nested division</div>\n</div>';
				input = '    ' + code.replace(/\n/g, '\n    ');
				output = '<pre><code>&lt;div&gt;\n    &lt;div&gt;nested division&lt;/div&gt;\n&lt;/div&gt;\n</code></pre>';
				expect(patchmark.parse(input)).to.equal(output);
			});


			it ('parse(input) should translate horizontal into <hr /> tag', function() {
				expect(patchmark.parse('* * *')).to.equal('<hr />');
				expect(patchmark.parse('***')).to.equal('<hr />');
				expect(patchmark.parse('*****')).to.equal('<hr />');
				expect(patchmark.parse('- - -')).to.equal('<hr />');
				expect(patchmark.parse('--------------')).to.equal('<hr />');
			});
		});


		describe('Span Elements', function () {

			it ('parse(input) should translate link into <a> tag', function() {
				var input = 'This is [an example](http://example.com/ "Title") inline link.';
				var output = '<p>This is <a href="http://example.com/" title="Title">an example</a> inline link.</p>';
				expect(patchmark.parse(input)).to.equal(output);

				input = '[This link](http://example.net/) has no title attribute.';
				output = '<p><a href="http://example.net/">This link</a> has no title attribute.</p>';
				expect(patchmark.parse(input)).to.equal(output);

				input = 'See my [About](/about/) page for details.';
				output = '<p>See my <a href="/about/">About</a> page for details.</p>';
				expect(patchmark.parse(input)).to.equal(output);

				//reference style link
				input = ([
					'This is [an example][id] reference-style link.',
					'',
					'',
					'[id]:http://example.com/ "Title"'
				]).join('\n');
				output = '<p>This is <a href="http://example.com/" title="Title">an example</a> reference-style link.</p>';
				expect(patchmark.parse(input)).to.equal(output);

				input = ([
					'This is [first example][foo1] reference-style link. This is [foo2][], [foo3]',
					'[foo1]: http://example.com/  "Optional Title Here"',
					'[foo2]: http://example.com/  \'Optional Title Here\'',
					'[foo3]: http://example.com/  (Optional Title Here)'
				]).join('\n');
				output = '<p>This is <a href="http://example.com/" title="Optional Title Here">first example</a> reference-style link. This is <a href="http://example.com/" title="Optional Title Here">foo2</a>, <a href="http://example.com/" title="Optional Title Here">foo3</a></p>';
				expect(patchmark.parse(input)).to.equal(output);

				input = ([
					'I get 10 times more traffic from [Google](http://google.com/ "Google") than from [Yahoo](http://search.yahoo.com/ "Yahoo Search") or [MSN](http://search.msn.com/ "MSN Search").',
				]).join('');
				output = '<p>I get 10 times more traffic from <a href="http://google.com/" title="Google">Google</a> than from <a href="http://search.yahoo.com/" title="Yahoo Search">Yahoo</a> or <a href="http://search.msn.com/" title="MSN Search">MSN</a>.</p>';
				expect(patchmark.parse(input)).to.equal(output);

				input = ([
					'I get 10 times more traffic from [Google] [1] than from [Yahoo] [2] or [MSN] [3].',
					'',
					'[1]: http://google.com/        "Google"',
					'[2]: http://search.yahoo.com/  "Yahoo Search"',
					'[3]: http://search.msn.com/    "MSN Search"'
				]).join('\n');
				expect(patchmark.parse(input)).to.equal(output);

				input = ([
					'I get 10 times more traffic from [Google][] than from [Yahoo][] or [MSN][].',
					'',
					'[Google]: http://google.com/        "Google"',
					'[Yahoo]: http://search.yahoo.com/  "Yahoo Search"',
					'[MSN]: http://search.msn.com/    "MSN Search"'
				]).join('\n');
				expect(patchmark.parse(input)).to.equal(output);
			});

			it('parse(input) should translate emphasize into <strong></strong> or <em></em> tags', function() {
				var input = ([
					'*single asterisks*',
					'_single underscores_',
					'**double asterisks**',
					'__double underscores__'
				]).join('\n');
				var output = ([
					'<p><em>single asterisks</em>',
					'<em>single underscores</em>',
					'<strong>double asterisks</strong>',
					'<strong>double underscores</strong></p>'
				]).join('\n');
				expect(patchmark.parse(input)).to.equal(output);

				input = 'un*frigging*believable';
				output = '<p>un<em>frigging</em>believable</p>';
				expect(patchmark.parse(input)).to.equal(output);

				input = '\\*this text is surrounded by literal asterisks\\*';
				output = '<p>*this text is surrounded by literal asterisks*</p>';
				expect(patchmark.parse(input)).to.equal(output);
			});

			it('parse(input) should translate code into <code></code> tag', function() {
				var input = 'Use the `printf()` function.';
				var output = '<p>Use the <code>printf()</code> function.</p>';
				expect(patchmark.parse(input)).to.equal(output);

				input = '``There is a literal backtick (`) here.``';
				output = '<p><code>There is a literal backtick (`) here.</code></p>';
				expect(patchmark.parse(input)).to.equal(output);

				input = ([
					'A single backtick in a code span: `` ` ``',
					'',
					'A backtick-delimited string in a code span: `` `foo` ``'
				]).join('\n');
				output = ([
					'<p>A single backtick in a code span: <code>`</code></p>',
					'<p>A backtick-delimited string in a code span: <code>`foo`</code></p>'
				]).join('\n');
				expect(patchmark.parse(input)).to.equal(output);

				input = 'Please don\'t use any `<blink>` tags.';
				output = '<p>Please don\'t use any <code>&lt;blink&gt;</code> tags.</p>';
				expect(patchmark.parse(input)).to.equal(output);

				input = '`&#8212;` is the decimal-encoded equivalent of `&mdash;`.';
				output = '<p><code>&amp;#8212;</code> is the decimal-encoded equivalent of <code>&amp;mdash;</code>.</p>';
				expect(patchmark.parse(input)).to.equal(output);
			});

			it('parse(input) should translate image into <img /> tag', function() {
				var input = ([
				   '![Alt text](/path/to/img.jpg)',
				   '![Alt text](/path/to/img.jpg "Optional title")'
				]).join('\n');
				var output = ([
					'<p><img src="/path/to/img.jpg" alt="Alt text" />',
					'<img src="/path/to/img.jpg" alt="Alt text" title="Optional title" /></p>',
				]).join('\n');
				expect(patchmark.parse(input)).to.equal(output);

				input = ([
					'![Alt text][id]',
					'',
					'[id]: url/to/image  "Optional title attribute"'
				]).join('\n');
				output = '<p><img src="url/to/image" alt="Alt text" title="Optional title attribute" /></p>';
				expect(patchmark.parse(input)).to.equal(output);
			});
		});


		describe('Miscellaneous Elements', function () {

			it('parse(input) should translate automatic links into <a> tag', function () {
				var input = '<http://example.com/>';
				var output = '<p><a href="http://example.com/">http://example.com/</a></p>';
				expect(patchmark.parse(input)).to.equal(output);
			});

			it('parse(input) should translate email links into <a href="mailto:"> tag', function () {
				var input = '<address@example.com>';
				var output = '<p><a href="&#x6d;&#x61;&#x69;&#x6c;&#x74;&#x6f;&#x3a;&#x61;&#x64;&#x64;&#x72;&#x65;&#x73;&#x73;&#x40;&#x65;&#x78;&#x61;&#x6d;&#x70;&#x6c;&#x65;&#x2e;&#x63;&#x6f;&#x6d;">&#x61;&#x64;&#x64;&#x72;&#x65;&#x73;&#x73;&#x40;&#x65;&#x78;&#x61;&#x6d;&#x70;&#x6c;&#x65;&#x2e;&#x63;&#x6f;&#x6d;</a></p>';
				expect(patchmark.parse(input)).to.equal(output);
			});


			it('parse(input) should escape backslashes', function () {
				var input = '\\\\\\`\\*\\_\\{\\}\\[\\]\\(\\)\\#\\+\\-\\.\\!';
				var output = '<p>\\`*_{}[]()#+-.!</p>';
				expect(patchmark.parse(input)).to.equal(output);
			});

		});
	});
})();