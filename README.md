# Table2MD - Convert Tables To Markdown

- Extracts and converts multiple HTML tables (even whole page source)
- Converts HTML links, code tags, line breaks (keep it as `<br>` if the table has multiple lines within a cell)
- Escape `|` characters
- Use first row as header or insert an empty first row
- First header/column style
- Adjust table width to be the same as the header, fill to match max width or trim to min width
- Smart selector which tries dynamically place cell dividers even if the table is badly formatted (see demo), with regex support
- Supported formats: HTML, spaces(2 or more), Excel, CSV, dash, and smart selection mode

## Use it here: https://xre0us.github.io/Table2MD/

## HTML Example

```
<table>
    <tr>
        <th>Fruit</th>
        <th>Color</th>
        <th>Taste</th>
    </tr>
    <tr>
        <td>Apple<a href="https://apple.com">apple.com</a></td>
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

Converts to:

```
| Fruit | Color | Taste |
| --- | --- | --- |
| Apple[apple.com](https://apple.com) | Red, Green, Yellow | Sweet |
| Banana | Yellow``#FFE135`` | Sweet |
| Orange | Orange | Citrusy \| sour |
```

## Smart Selector Example
```
PORT     STATE   SERVICE  SUB-SERVICE     VERSION
22/tcp   open    ssh      protocol       OpenSSH 8.2 (protocol 2.0)
25/tcp open     smtp      mail-queue Postfix smtpd
53/tcp     open  domain DNS-resolver       BIND 9.11.4-P2
80/tcp   open    http     web-host Apache httpd 2.4.41
110/tcp  open   pop3   email-fetch  Dovecot pop3d
111/tcp  open rpcbind    RPC-routing  2-4 (RPC #100000)
143/tcp    open imap     email-store   Dovecot imapd
443/tcp  open https     SSL-handshake      OpenSSL/1.0.2k
587/tcp  open   submissi email-relay   Postfix smtpd
993/tcp    open  imaps       -            Dovecot imapd
995/tcp  open   pop3s    email-secure   Dovecot pop3d
3306/tcp open    mysql      DB-main     MySQL 5.7.30
5432/tcp open    postgresql  DB-secondary PostgreSQL DB 11.8
8080/tcp open   http-proxy proxy-gateway Nginx 1.17.9
8443/tcp open   https-alt   java-server Apache Tomcat/Coyote   JSP engine 1.1
```
Converts to:
```
| PORT | STATE | SERVICE | SUB-SERVICE | VERSION |
| --- | --- | --- | --- | --- |
| 22/tcp | open | ssh | protocol | OpenSSH 8.2 (protocol 2.0) |
| 25/tcp | open | smtp | mail-queue Postfix | smtpd |
| 53/tcp | open | domain | DNS-resolver | BIND 9.11.4-P2 |
| 80/tcp | open | http | web-host Apache | httpd 2.4.41 |
| 110/tcp | open | pop3 | email-fetch  Dovecot | pop3d |
| 111/tcp | open | rpcbind | RPC-routing  2-4 | (RPC #100000) |
| 143/tcp | open | imap | email-store | Dovecot imapd |
| 443/tcp | open | https | SSL-handshake | OpenSSL/1.0.2k |
| 587/tcp | open | submissi | email-relay | Postfix smtpd |
| 993/tcp | open | imaps | - | Dovecot imapd |
| 995/tcp | open | pop3s | email-secure | Dovecot pop3d |
| 3306/tcp | open | mysql | DB-main | MySQL 5.7.30 |
| 5432/tcp | open | postgresql | DB-secondary | PostgreSQL DB 11.8 |
| 8080/tcp | open | http-proxy | proxy-gateway | Nginx 1.17.9 |
| 8443/tcp | open | https-alt | java-server | Apache Tomcat/Coyote   JSP engine 1.1 |
```

With threshold at 25, some of the items are off but it's pretty good considering it will take way longer to manually fix it.

#### The inputs:
- **Table width**: Sets the table width, will create empty cells if it cannot match the requirement, will cut off cells longer than the width
- **Delimiter**: The delimiter of the table, like `-` or `+`. Or add your own regex here, then it will tries to match for the cell character rule (see below), defaults to match spaces (entering nothing is equal to using `space (smart selection)`).
- **Additional cell characters**: By default, only alphanumeric characters are chosen as the start and end of a cell, add additional characters here.
- **Threshold**: The % where a cell breakpoints must appear over all the rows for the separator to be created, basically, higher will mean less cell dividers, lower means more.
- **Converting**: If there are more than one set of cell breakpoints with the same percentage, the result will be shuffled on each conversion. The example above is one of the possible results.

#### Other Tips & Tricks
- **Use "trim blank lines"`**: blank lines will affect the accuracy of the cell breakpoints.
- **Make empty tables**: Turn off trim blank lines, hit enter for rows, set number of columns in the table width input.
- **Convert to CSV/Excel**: Remove the divider row, go to import wizard under paste, choose delimited, select only "other" as delimiter, enter `|`. You will need to delete the first and last columns.


### How It Works
This is not a text extractor where it creates a table from any text, it requires some existing pattern to work, so assume that the input data is meant to be a table, or is formatted in a somewhat consistent way, and each line represents a row. The most important attribute is that the cells are spaced (or any other characters chosen) evenly. The example is probably a more extreme case you can throw at it.

The program first find all the possible breakpoints, then choose the ones with the most occurrence that is higher than the threshold. It then tries to find the exact divider of a cell by matching the delimiter and cell contents. 

More rows will return a more accurate result since there are more data points, it is not perfect but does what I need it to do pretty well, I haven't tested it against everything so there might be some odd behaviour. Some minor editing or adding extra cell characters will help to improve the results. You can also change the settings or convert again to reshuffle the result.

TL;DR? It's magic. Just move the slider and hope for the best.

##
There are a ton of these out there, why did I write this?

I often have tables that I want to add to my markdown document, but sometimes they come in weird formats which doesn't play well with all the other converters I have tried. Why manually edit them when I can spend hours writing this program to solve my niche problem?

This program was originally written to convert HTML tables only and has been adapted to convert other formats, hence the use of `createElement` to process the cells.

### Escape pipe characters for obsidian.md

[obsidian](https://obsidian.md/) (yes I know it displays HTML) has a long standing [problem](https://forum.obsidian.md/t/pipe-problems-in-tables-math-latex-inline-code-and-separator/3692/2) of escape pipe characters being shown in inline code in tables.

E.g. the cell
<table>
<td><code>this\|that</code></td>
</table>

will be shown as-is in obsidian. Changing `|` to `&#124` fixes it.