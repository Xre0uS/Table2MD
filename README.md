# HTML Table to Markdown+

Functions:
- Extracts and converts multiple tables (even whole page source)
- Converts links in table
- Converts code tags in table
- Escape pipe characters
- Use first row as header or insert an empty first row
- Bold headers
- Bold first column
- First column as code

## Use it here: https://xre0us.github.io/html-table-to-markdown-plus/

## Example

HTML table:
<body>
    <table>
        <tr>
            <th>Fruit</th>
            <th>Color</th>
            <th>Taste</th>
        </tr>
        <tr>
            <td>Apple<a href="https://apple.com"> apple.com<a></td>
            <td>Red, Green, Yellow</td>
            <td>Sweet</td>
        </tr>
        <tr>
            <td>Banana</td>
            <td>Yellow<code>#FFE135</code></td>
            <td>Sweet</td>
        </tr>
        <tr>
            <td>Orange</td>
            <td>Orange</td>
            <td>Citrusy | sour</td>
        </tr>
    </table>
</body>

```
<table>
    <tr>
        <th>Fruit</th>
        <th>Color</th>
        <th>Taste</th>
    </tr>
    <tr>
        <td>Apple<a href="https://apple.com"> apple.com<a></td>
        <td>Red, Green, Yellow</td>
        <td>Sweet</td>
    </tr>
    <tr>
        <td>Banana</td>
        <td>Yellow<code>#FFE135</code></td>
        <td>Sweet</td>
    </tr>
    <tr>
        <td>Orange</td>
        <td>Orange</td>
        <td>Citrusy | sour</td>
    </tr>
</table>
```

Converts to with default options:

| Fruit | Color | Taste |
| --- | --- | --- |
| Apple[ apple.com](https://apple.com) | Red, Green, Yellow | Sweet |
| Banana | Yellow``#FFE135`` | Sweet |
| Orange | Orange | Citrusy \| sour |

```
| Fruit | Color | Taste |
| --- | --- | --- |
| Apple[ apple.com](https://apple.com) | Red, Green, Yellow | Sweet |
| Banana | Yellow``#FFE135`` | Sweet |
| Orange | Orange | Citrusy \| sour |
```

I'm surprised to find no table converters around that converts links or code tags, in fact, the only instances that I could find that do it properly is [this Debian package](https://manpages.debian.org/testing/python3-html2text/html2markdown.py3.1.en.html) and [turndown](https://github.com/mixmark-io/turndown) with [turndown-plugin-gfm](https://github.com/mixmark-io/turndown-plugin-gfm). But what if I just want to quickly copy/paste a table? Here is my take on it.
