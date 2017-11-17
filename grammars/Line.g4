grammar Line;

file
: terminatedLine* lastline EOF
;

terminatedLine
: line EOL
;

lastline
: CHAR*
;

line
: CHAR*
;

EOL
: ('\r\n'|[\n\r\u2028\u2029])
;

CHAR
: .
;
