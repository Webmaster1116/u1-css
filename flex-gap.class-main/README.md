# flex-gap.class

`u1-flex-gap` class to allow gaps in flex-boxes.  
Uses margin and negative margin needed because of safari.  


- Wrap by default
- Gaps by default (--gap ie 1rem)
- no overflow:hidden
- no minus margin on the right (prevent overflows)
- margins are made using !important to prevent confusion


# Ussage

add a wrapper element if you like to add margin to the container

```html
<link rel=stylesheet href="https://cdn.jsdelivr.net/gh/u1ui/flex-gap/flex-gap.css" media=print><!-- add verison! "/flex-gap@x.y.z" -->

<div style="margin:2rem">
  <ul class=u1-flex-gap style="--u1-Row-gap:2em; --ui-Col-gap:1em">
    <li> first
    <li> second  
    <li> last
  </u1>
<div>
```

## Demo
https://raw.githack.com/u1ui/flex-gap.class/main/tests/test.html  

