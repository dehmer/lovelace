Ideas for possible improvements for milsymbol@2.0.1

GENERAL
* favor maintainability over time/performance over space/memory
* reduce overall complexity (1,827 branches, 28,534 statements)
* consistently apply ES6 style throughout the code
* replace deprecated String.substr()
* replace == and != with === and !==
* use immutable objects whenever appropriate (incl. Symbol)
* never modify actual parameters
* remove/replace all var declarations
* favor map/reduce over loops
* reduce (global) symbol state as far as possible

SPECIFIC
* drop Canvas2D support (for now)
* define icon parts declaratively, preferably in JSON definition files
* add named styles to icon parts depending on symbol options
* use expression framework for dynamic texts
* defer styling as long as possible
* use XML library to generate SVG from JavaScript object
* use SVG compliant attributes throughout the code
* hoist default style attributes to SVG namespace
* define icons (composition of icon parts) declaratively
* introduce SVG group to scale/transform icon parts
* improve separation of symbol style options and effective style
* remove icon cache
* move SIDC-dependent metadata to JSON configuration
* abstract styling over letter and number SIDC (alpha/numeric)
* fail fast (on invalid SIDCs), expose Error class to extensions
* define and expose interface/pipeline for symbol parts and composition
* use simple layout framework for placement/alignment (if possible)
* use expression framework for text modifiers/amplifiers

DIMENSIONS:
===========
UNKNOWN
AIR
SPACE
[SURFACE:LAND:]UNIT
[SURFACE:LAND:]EQUIPMENT
[SURFACE:LAND:]INSTALLATION
[SURFACE:LAND:]DISMOUNTED
[SURFACE:LAND:]ACTIVITY (incl. EVENT)
[SURFACE:]SEA
SUBSURFACE

STANDARD IDENTITIES:
====================


DISPLAY OPTIONS:
================
FRAME: ON/OFF (FRAME COLOR)
FILL: ON/OFF (FILL COLOR)
ICON: ON/OFF (ICON COLOR)
MODIFIERS: ON/OFF (ICON COLOR)
