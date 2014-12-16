patchmark
============

A JavaScript Markdown Parser.


Usage
====

## Browser


Install `patchmark` package with bower:

```bash
$ bower install patchmark --save
```

Example:
```html
<!DOCTYPE html>
<html>
	<body>
		<textarea id="editor" style="width:400px;height:100px;">
		Type some **markdown** here.
		</textarea>
		<div id="preview"></div>

		<script type="text/javascript" src="bower_components/patchmark/dist/patchmark.min.js"></script>
		<script type="text/javascript">
			function markdown() {
				var $preview = $("preview"),
					$editor = $("editor");

				function $(id) {
					return document.getElementById(id);
				}

				function update() {
					$preview.innerHTML = patchmark.parse($editor.value);
				}

				$editor.oninput = update;
				update();
			}

			markdown();
		</script>
	</body>
</html>
```



Build
====

Clone a copy of the repository:

```bash
$ git clone git://github.com/hidcliff/patchmark.git
```

Enter the patchmark directory, install dependencies, and run `grunt` command:

```bash
$ cd patchmark
$ npm install
$ grunt
```

The `/dist` subdirectory will be created and new copy will be put in the directory, along with the minified copy.


Running Unit Tests
=====

## Browser

Enter the test directory and install dependencies for Unit Tests:

```bash
$ cd test
$ bower install
```

Run `index.html` in a browser

## Grunt

``` 
grunt test
```
