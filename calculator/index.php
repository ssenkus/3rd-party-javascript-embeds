<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8">
        <title>Arc Flash Calculator Embed Test</title>

        <!-- TEST FOR JQUERY PRESENCE IN PAGE -->
        <!-- <script src="//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script> -->
        <link rel="stylesheet" href="http://www.graphicproducts.com/styles/default.css" />
        <style>

            html {
                width: 100%;
            }

            body {
                width: 1080px;
                margin: 100px auto 0px;
                padding: 0;
                text-align: center;
                background-color: #000;
            }


            #main {
                width: 700px;
                height:900px;
                margin: 0 10px;
                float: left;
                border: 1px solid #e00;
                background-color: #e0e0e0;
            }

            #sidebar {
                width: 300px;
                height: 900px;
                float: left;
                border: 1px solid #e00;
                background-color: #e0e0e0;
                overflow: hidden;
                position: relative;
            }

        </style>
    </head>
    <body>

        <div id="main">
            <h1>Main Content</h1>
            <p>The standard Lorem Ipsum passage, used since the 1500s<br />
                "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
                Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in 
                voluptate velit esse cillum dolore eu fugiat nulla pariatur. <br />
                Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."</p>

            <p>Section 1.10.32 of "de Finibus Bonorum et Malorum", written by Cicero in 45 BC</p>
            <p>"Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?"</p>


            <!-- Widget Initialization Script 
                    DESCRIPTION & USAGE     
                            - User gets the following <script> & <noscript> block from widget calculator 'Add To Site' box and adds to their site. 
                            - The initialization script is loaded on the host site and requests an additional bootloader script file to build the widget 
            -->
            <!--
             Widget Bootloader Script
                    - We use jQuery for cross-browser support and design simplicity. This dependency must be checked for: 
                            - Presence on the page/visitor browser cache (must check for compatible version) 
                            - If not on the page, it must be loaded and execution of the main GPWIDGET script must be delayed until it is ready
                    - Once we verify jQuery is available, we start the initialization process, adding JS/CSS/HTML to the host page to build the widget
                    NOTES:
                    * If the website visitor has Javascript disabled, the <noscript> block is displayed; 
                      this is included for SEO purposes and can be styled if necessary. 
                    * 
            -->

            <script id="gpEmbedScript" type="text/javascript">
                (function() {
                    var s = document.createElement('script'),
                            node = document.getElementsByTagName('script')[0];
                    s.type = 'text/javascript';
                    s.id = "gpEmbedCalc-afc";
                    s.async = true;
                    s.src = document.location.protocol + '//dev.graphicproducts.com/test-widget/test.js'
                    node.parentNode.insertBefore(s, node);
                })();
            </script>

        </div>
        <div id="sidebar">
            <h3>Sidebar</h3>
            <hr />
            <div id="gpEmbedBuild"></div>
            <noscript><p style="border: 2px dotted #000!important; background-color:#fff!important; color: #f70!important; padding: 4px!important; font-weight:bold!important; font-family: Helvetica, Arial, sans-serif!important; ">Please enable Javascript to use this Graphic Products widget!<br />  More information at <a href="//www.graphicproducts.com/syndication">GP Syndication</a></p></noscript>
            <hr />
            <ul>
                <li><a href="//dev.graphicproducts.com/test-widget/test.js">test.js</a></li>
                <li><a href="//dev.graphicproducts.com/test-widget/arc-flash/html/arc-flash.html">arc-flash.html</a></li>
                <li><a href="//dev.graphicproducts.com/test-widget/arc-flash/css/arc-flash.css">arc-flash.css</a></li>
                <li><a href="//dev.graphicproducts.com/test-widget/arc-flash/js/arc-flash.js">arc-flash.js</a></li>
            </ul>
        </div>
        <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script>
    </body>
</html>