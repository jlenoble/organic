grammar Line;

file
: terminatedLine* line EOF
;

terminatedLine
: line EOL
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
