const isSubpage =
    window.location.pathname.includes("/research/") ||
    window.location.pathname.includes("/notes/") ||
    window.location.pathname.includes("/projects/") ||
    window.location.pathname.includes("/resources/");

const prefix = isSubpage ? "../" : "";

const navigation = `
<header class="navbar">

    <nav class="main-nav" aria-label="Main navigation">
        <a href="${prefix}index.html">Home</a>
        <a href="${prefix}research.html">Research Notes</a>
        <a href="${prefix}projects.html">Projects</a>
        <a href="${prefix}notes.html">Notes</a>
        <a href="${prefix}resources.html">Resources</a>
        
        
    </nav>

</header>
`;

document.getElementById("site-navigation").innerHTML = navigation;