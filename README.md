patchmark
============

A JavaScript Markdown Parser.

Usage
====

Browser
-----

```
<textarea id="editor" style="width:400px;height:100px;">
Type some **markdown** here.
</textarea>
<div id="preview"></div>

<script type="text/javascript" src="src/patchmark.js"></script>
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
```
