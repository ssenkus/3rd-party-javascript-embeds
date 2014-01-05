(function($, GP) {

    $(document).ready(function() {

        var widgetName = 'Arc Flash Calculator';
        var userData = {};
        var siteData = {};

        var addSiteJS = $('#gpEmbedScript').text();

        function getUserInfo() {
            /* data that we can send to our servers*/
            /* for research purposes */

            siteData.hostPage = window.location;
            siteData.timePageOpen = window.performance.timing.navigationStart;
            siteData.timeSinceOpen = window.performance.now();
            siteData.widgetPos = $('#gpWrap').offset();
            siteData.cookieData = window.document.cookie;

            alert('DATA TO BE SENT TO THE SERVER\n\n\n' +
                    'host_page: \t\t\t' + siteData.hostPage + '\n' +
                    'time_page_opened: \t' + siteData.timePageOpen + '\n' +
                    'time_since_open: \t' + siteData.timeSinceOpen + '\n' +
                    'widget_pos_x:\t\t' + siteData.widgetPos.left + '\n' +
                    'widget_pos_y:\t\t' + siteData.widgetPos.top + '\n' +
                    'cookie_data:\t\t\t' + siteData.cookieData + '\n'
                    );
            GP.addToExports({'siteData': siteData});

        }

        function getWidgetHtml() {
            $.ajax({
                type: 'GET',
                url: GP.getUrl.baseWidgetUrl + "html/arc-flash.html",
                async: true,
                // dataType: 'jsonp', // need this according to SOP
                success: function(html) {
                    console.log('AJAX Request - SUCCESS - Received HTML');
                    $("#gpEmbedBuild").css('opacity', 0).append(html);
                },
                error: function(e) {
                    console.log('error', e);
                },
                complete: function() {
                    renderWidget();
                }
            });
        }



        getWidgetHtml();

        function renderWidget() {
            // don't load until images & css have 
            var btnAddToSiteImg = new Image();
            btnAddToSiteImg.src = 'http://dev.graphicproducts.com/test-widget/arc-flash/img/btn-addToSite.png';
            btnAddToSiteImg.onload = function() {
                // Animate widget opacity into view.
                $('#gpEmbedBuild').animate({
                    opacity: '1'
                }, 400, 'swing', function() {
                    console.log('Widget completed fadeIn()');
                });
            };

            console.log('AJAX Request - COMPLETE - Add functionality');

            // Views for the Arc Flash widget
            var $views = {
                input: $('#gpInputs'),
                output: $('#gpOutputs'),
                inputInfo: $('#gpInputsInfo'),
                warning: $('#gpOutputsWarning'),
                addToSite: $('#gpAddToSiteBox')
            };


            // Switch between widget views
            function viewSelect(view) {
                for (var prop in $views) {
                    if ($views.hasOwnProperty(prop)) {
                        $views[prop].hide();
                    }
                }
                $views[view].show();
            }
            ;



            // -- CLICK EVENTS --
            // convenience function for dev; remove when navigation is ready
            $('#gpTitle').on('click', function() {
                viewSelect('input');
            });

            //  Add to site button, get code embedded on the site and 
            $('#addToSite').on('click', function() {
                viewSelect('addToSite');
                $('#copyCalc').val(GP.embedCode());
            });


            //  Click on textbox for 'Add to Site', selects all text for user to embed in their site
            $('#copyCalc').on('click', function() {
                $(this).select();
            });

            // reset inputs and outputs
            $('#gpReset').on('click', inputReset);

            $('#gpGoStart').on('click', function() {
                viewSelect('input');
                inputReset();
            });

            // Dummy help function
            $('#gpHelp').on('click', getUserInfo);

            // get info about each input by clicking on the Question Mark
            $('.gpQuestMark').on('click', function() {
                var selQuest = $(this).parent().attr('for');
                console.log(selQuest);
            });



            function inputReset() {
                // Set defaults for select elements
                $('#Rating').find('option:eq(3)').prop('selected', true);
                $('#Volts').find('option:eq(3)').prop('selected', true);
                $('#Gap').find('option:eq(0)').prop('selected', true);
                $('#Lgibf').find('option:eq(0)').prop('selected', true);
                $('#Distance').find('option:eq(5)').prop('selected', true);
            }

            function adRotator() {
                var counter = 0;
                var timeInterval = 5000;
                var swapper = setInterval(function() {
                    swapImage(++counter, timeInterval);
                    if (counter === 6) {
                        clearInterval(swapper);
                    }
                }, timeInterval);
            }

            function swapImage(counter, timeInterval) {
                var adImages = ['img/gp-ad00.png', 'img/gp-ad01.png', 'img/gp-ad02.png'];
                var adImage = $('#gpAdImage');
                console.log(counter);
                counter = counter % adImages.length;
                console.log(counter);
                /*   Maybe an AJAX call to see if images are available before swapping????
                 AJAX GET request validates existence, if so, then add to array
                 ex. adImages.push(retrievedAdImageSrc);
                 */
                // var curAdImageSrc = adImage.attr('src');
                adImage.fadeOut(timeInterval / 10, function() {
                    adImage.attr('src', baseWidgetUrl + adImages[counter]);
                    adImage.fadeIn(timeInterval / 5);
                });
            }


            // Replaces the old alert messages with a in-widget message before delivering calculations
            function displayCalcWarning(msg) {
                $('#gpOutputsWarning').append(msg).fadeIn(500, function() {
                    $(this).delay(2000).fadeOut(500);
                });

            }


            $('.gpThemeSwitcher').on('click', function() {
                // might not be necessary if images are combined on one sprite
                var themeSwapClass = $(this).attr('id').split('-');
                console.log('Changed theme to ' + themeSwapClass[1]);
                GP.addToExports({'theme_switched': themeSwapClass[1]});
                if (themeSwapClass[1] === 'patriot') {
                    var patroitThemeBgImg = new Image();
                    patroitThemeBgImg.src = 'http://dev.graphicproducts.com/test-widget/arc-flash/img/flag.jpg'
                    patroitThemeBgImg.onload = function() {
                        console.log('flag image has been loaded!  Swap styles now!');
                        themeSwapClass = 'gpWidgetTheme-' + themeSwapClass[1];
                        $('#gpWrap').removeClass().addClass(themeSwapClass);
                    }
                } else {
                    themeSwapClass = 'gpWidgetTheme-' + themeSwapClass[1];
                    $('#gpWrap').removeClass().addClass(themeSwapClass);
                }
            });

            $('#gpSolve').on('click', function() {
                // Log user interaction
                GP.addToExports({'solve': true});

                viewSelect('output');

                /* FIX THIS CODE!!! */
                // <!-- Input Variables
                var rating = $('#Rating').val();
                var volts = $('#Volts').val();
                var gap = $('#Gap').val();
                var Lgibf = $('#Lgibf').val();
                var distance = $('#Distance').val();

                // <!-- ======================================================================
                // <!-- Derived Variables
                var Cvolts = (volts / 1000);
                var Crating = 0;
                var Dfactor = "";
                var CIbf = 0;
                var Ibf = 0;
                // <!-- ======================================================================
                // <!-- Loop Counters
                var i = "";
                var j = "";
                var m = "";
                var M = "";
                var loop = 0;
                var F1 = 0;
                var F2 = 0;
                var C1 = 0;
                var C2 = 0;
                // <!-- ======================================================================
                // <!-- Constants
                var pad1 = "";
                var pad2 = "";
                var pad3 = "";
                var pad4 = "";
                var pad5 = "";
                var size = "";
                var TER = 0;
                var Cbf = 0;
                var AT = 0; // Addition Term
                var MIbf = 0; // Multiplier Term for Ibf/Current
                var IIbf = 0;
                var BAT = 0; // Addition Term (Boundary Eq)
                var BMIbf = 0; // Multiplier Term for Ibf/Current (Boundary Eq)
                var CM = 4.184; // Common Multiplier
                var Emin = 0.25; // Fixed Default Min for Inc/Energy
                var Emax = 100.0; // Fixed Default Max for Inc/Energy
                var x = 0; // Computational Exponent (from Table 4)
                var K = 0; // Computational Constant for Arcing Current
                var k1 = ""; //
                var k2 = ""; // Computational Constant for Grounded System
                var k3 = "";
                var CF = 0; // Computational Constant for Incident Energy
                var Ngap = ""; // Computational Arc Gap
                var range = ""; // Voltage Range - Standard/Lee Calculation
                var jccf = 0.23889; // Conv/Factor; Joules:Calories (1Kcal=4186.0 J)
                var mmincf = 0.03937; // Conv/Factor; mm:inches
                // <!-- ======================================================================
                // <!-- Computation Variables
                var DEcb = 0;
                var DEf = 0;
                var maflg = 0;
                var Z1 = 0;
                var Z2 = 0;
                var DM1 = 0;
                var DM2 = 0;
                var Ecb = 0;
                var HL = 0;
                var HRCF = 0; // Hazard Risk Category Fuse
                var HRCC = 0; // Hazard Risk Category CB
                var Eflag = 0;
                var EF = 0;
                var EC = 0;
                var PPEF = 0; // Personal Protective Equipment Index - Fuse
                var PPEC = 0; // Personal Protective Equipment Index - CB
                var P = 0; // Exponent
                var PF = 0;
                var PC = 0;
                var Ejf = 0; // Computed E from packed Eq.
                var Ejc = 0; // Computed E from packed Eq.
                var Esd = 0; // Stored Def/E from packed Eq.
                var lim1 = 0; // Current Limit Parm
                var lim2 = 0; // Current Limit Parm
                var lim3 = 0; // Current Limit Parm
                var lim4 = 0; //
                var nbr = 0; //
                var nbr1 = 0; // 
                var nbr2 = 0; // 
                var nbr3 = 0; // 
                var nbr4 = 0; // 
                var pass = 0; // Current Loop ID
                var loop = 0; // Current Loop ID
                var flag = 0; // Current Loop ID
                var result1 = ""; // Test Variable
                var Lgiarc = ""; // Computed Log10/Arcing Current (iar)
                var iarc1 = ""; // Computed Intermediate Currentc in KA)
                var iarc2 = ""; // Computed Intermediate Current (KA (x 0.85) (KA)
                var tarc = ""; // Arcing Time  (seconds)
                var Ia = 0; // Converted/Log10 Current
                var Iarc = 0; // Resultant Arcing Current (KA)
                var len = 0; // Length of String
                var LgCBIT = 0;
                var LgI1 = 0;
                var LgNEinc = 0; // Computed Log10/Normalized Inc/Energy
                var Ienergy = 0; // Computed Inc/Energy (J/Cm)
                var NIenergy = 0; // Computed Normalized Inc/Energy (J/Cm)
                var JIenergy = 0; // Computed Inc/Energy (J/Cm)
                var CIenergy = 0; // Computed Inc/Energy (C/Cm)
                var Esj = 0;
                var Einc = 0;
                var EincF = 0; // Computed Inc/Energy Fuse (J/Cm)
                var EincCB = 0; // Computed Inc/Energy Circuit Breaker (J/Cm)
                var CIenergy = 0; // Incident Energy
                var IBenergy = 0; // Intermediate Boundary Energy (J/Cm)
                var FBdistancem = 0; // Computed Flash-Prot Boundary Distance Fuse (mm)
                var CBdistancem = 0; // Computed Flash-Prot Boundary Distance CB (mm)
                var FBdistancei = 0; // Converted Flash-Prot Boundary Distance Fuse (in)
                var CBdistancei = 0; // Converted Flash-Prot Boundary Distance CB (in)
                var PBdist = 0;
                var Cdist = 0; // Converted Flash-Protection Boundary Distance (CB)
                var Fdist = 0; // Converted Flash-Protection Boundary Distance (Fuse)
                var CBtime = 0; // Circuit Breaker Opening Time (seconds)
                var FOtime = 0; // Fuse Opening Time (seconds)
                var Ctime = 0; // Computation Opening Time (seconds)
                var Dboundary = ""; // Flash Protection Boundary
                var ptr1 = ""; // Pointer/Position into name array
                var ptr2 = ""; // Pointer/Position into time array
                var ptr3 = 0; // Pointer/Position into Parm array
                var ptr4 = 0; // Pointer/Position into Parm array
                var indx = ""; // Delimiter Position in string
                var indx1 = ""; // Delimiter Position in string
                var Aname = ""; // Name of Current Array
                var Pstr = ""; // Current Packed String
                var PPE = 0;
                //var Atime = 0;                      // Arcing Time for Boundary
                // <!--
                // <!-- Reminder vars
                // <!-- ======================================================================
                if (volts <= 15000) {
                    range = "STD";
                } // Standard voltage range
                else {
                    range = "LEE";
                } // Non-standard voltage range (Lee Method)
                // <!-- End Range
                // <!-- Messages
                var warn1 = "WARNING - Incident Energy above 40 Cal/Cm-Sq.";
                var warn2 = " Select PPE Suitable for Protection at Indicated Incident Energy";
                var warn3 = "WARNING - Protection Boundary Exceeds 120 Inches";
                var warn4 = "WARNING - Circuit Breaker Incident Energy exceeds 100 Cal/Cm-Sq.";
                var warn5 = "WARNING - Fuse Incident Energy exceeds 100 Cal/Cm-Sq.";
                var warn6 = "WARNING - Fuse and Circuit Breaker Incident Energies exceed 100 Cal/Cm-Sq.";
                var warn7 = "WARNING - Fuse Incident Energy exceeds 40 Cal/Cm-Sq.";
                var warn8 = "WARNING - Circuit Breaker Incident Energy exceeds 40 Cal/Cm-Sq.";
                //var warn9 = "This far";
                // <!-- ======================================================================
                // <!-- Fuse Clearing Time Selection
                // <!-- ============================================
                // <!-- Recover Lgibf, Array Name Pointer from Packed Format
                {
                    indx = (Lgibf.indexOf(":"));
                }
                if (indx === 1) {
                    ptr1 = (Lgibf.substring(0, 1));
                } else {
                    ptr1 = (Lgibf.substring(0, 2));
                }
                // <!--
                {
                    len = Lgibf.length;
                }
                {
                    Lgibf = Lgibf.substring((indx + 1), (len + 1));
                }
                {
                    CIbf = Math.pow(10, Lgibf);
                }
                //{CIbf = (CIbf/1);}
                {
                    Ibf = Math.floor(CIbf);
                }
                // <!-- End Recover Lgibf
                // <!-- ============================================
                // <!-- Recover Equations/Parameters
                {
                    Crating = rating;
                }
                if (Crating <= 100) {
                    Crating = 100;
                }
                {
                    ptr3 = (Crating / 100);
                }
                // <!------------------------------
                // <!-- Constant Selection Logic
                // <!-- For Switchgear only; assigning distance exponent
                // <!-- Variables Assigned from Std/1584 Table 4
                // <!--
                if (volts <= 1000) {
                    P = 1.473, CF = 1.5, Ngap = 32;
                } else {
                    P = 0.973, CF = 1.0;
                }
                // <!--
                //if (volts > 600)
                //{CBtime = 0.10;}
                if (1000 < volts && volts <= 5000) {
                    Ngap = gap;
                }
                if (5000 < volts && volts <= 15000) {
                    Ngap = 152;
                }
                // <!-- End Switchgear
                // <!------------------------------
                // <!-- For Resultant Arcing Current  (Iarc)
                // <!--
                if (volts < 1000) //K = (-0.097)
                {
                    Lgiarc = (-0.097) + (0.662 * (Lgibf)) + (0.09669 * (Cvolts)) + (0.000526 * (Ngap)) +
                            (0.5588 * (Cvolts) * (Lgibf)) - (0.00304 * (Ngap) * (Lgibf));
                }
                // <!--
                if (1000 <= volts && volts <= 15000) {
                    Lgiarc = 0.00402 + (0.983 * (Lgibf));
                }
                //K = (0) ; Voltage >=1KV
                if (volts > 15000) {
                    Lgiarc = Lgibf;
                }
                // <!--
                {
                    Ia = Math.pow(10, Lgiarc);
                }
                {
                    iarc1 = Ia;
                }
                {
                    iarc2 = (Ia * (0.85));
                }
                //if (iarc1 > iarc2)
                {
                    Iarc = iarc1;
                }
                // <!-- End Arcing Current
                // <!-- ======================================================================
                // <!-- Start Main two-pass loop body for computing Fuse/CB data.
                // <!-- ======================================================================
                // <!--
                {
                    pass = 1;
                }
                do {
                    // <!-- ==================================
                    // <!-- Determine Fuse Energy Values --
                    if (pass == 1) {
                        flag = 0;
                    }
                    switch (ptr3) {
                        // <!--
                        case 1:
                            if (Ibf < 0.65) {
                                flag = 1;
                            }
                            if (flag != 1) {
                                if (0.65 <= Ibf && Ibf <= 1.16) {
                                    MIbf = (-11.176), AT = (13.565);
                                }
                                if (1.16 < Ibf && Ibf <= 1.40) {
                                    MIbf = (-1.4583), AT = (2.2917);
                                }
                                if (1.40 < Ibf) {
                                    Esd = (1.046), flag = (2);
                                }
                            }
                            break;
                            // <!--
                        case 2:
                            if (Ibf < 1.16) {
                                flag = 1;
                            }
                            if (flag != 1) {
                                if (1.16 <= Ibf && Ibf <= 1.60) {
                                    MIbf = (-18.409), AT = (36.355);
                                }
                                if (1.60 < Ibf && Ibf <= 3.16) {
                                    MIbf = (-4.2628), AT = (13.721);
                                }
                                if (3.16 < Ibf) {
                                    Esd = 1.046, flag = (2);
                                }
                            }
                            break;
                            // <!--
                        case 4:
                            if (Ibf < 3.16) {
                                flag = 1;
                            }
                            if (flag != 1) {
                                if (3.16 <= Ibf && Ibf <= 5.04) {
                                    MIbf = (-19.053), AT = (96.808);
                                }
                                if (5.04 < Ibf && Ibf <= 22.60) {
                                    MIbf = (-0.0302), AT = (0.9321);
                                }
                                if (22.60 < Ibf) {
                                    Esd = 1.046, flag = (2);
                                }
                            }
                            break;
                            // <!--
                        case 6:
                            if (Ibf < 8.50) {
                                flag = 1;
                            }
                            if (flag == 1) {
                                if (Ibf == 8) {
                                    flag = 3, Esj = 154.24;
                                }
                            }
                            if (flag != 1 && flag != 3) {
                                if (8.50 <= Ibf && Ibf <= 14.00) {
                                    MIbf = (-3.0545), AT = (43.364);
                                }
                                if (14.00 < Ibf && Ibf <= 15.70) {
                                    Esd = 2.510, flag = (2);
                                }
                                if (15.70 < Ibf && Ibf <= 22.60) {
                                    MIbf = (-0.0507), AT = (1.3964);
                                }
                                if (22.60 < Ibf) {
                                    Esd = 1.046, flag = (2);
                                }
                            }
                            break;
                            // <!--
                        case 8:
                            if (Ibf < 15.70) {
                                flag = 1;
                            }
                            if (flag == 1) {
                                if (Ibf == 10) {
                                    flag = 3, Esj = 315.78;
                                }
                                if (Ibf == 15) {
                                    flag = 3, Esj = 91.79;
                                }
                            }
                            if (flag != 1 && flag != 3) {
                                if (15.70 <= Ibf && Ibf <= 44.10) {
                                    MIbf = (-0.0601), AT = (2.8992);
                                }
                                if (44.10 < Ibf) {
                                    Esd = 1.046, flag = (2);
                                }
                            }
                            break;
                            // <!--
                        case 12:
                            if (Ibf < 15.70) {
                                flag = 1;
                            }
                            if (flag == 1) {
                                if (Ibf == 15) {
                                    flag = 3, Esj = 74.53;
                                }
                            }
                            if (flag != 1 && flag != 3) {
                                if (15.70 <= Ibf && Ibf <= 22.60) {
                                    MIbf = (-0.1928), AT = (14.226);
                                }
                                if (22.60 < Ibf && Ibf <= 44.10) {
                                    Esd = CM * ((0.0143 * Ibf * Ibf) - (1.3919 * Ibf) + 34.045), flag = (2);
                                }
                                if (44.10 < Ibf) {
                                    Esd = 1.630, flag = (2);
                                }
                            }
                            break;
                            // <!--
                        case 16:
                            if (Ibf < 15.70) {
                                flag = 1;
                            }
                            if (flag == 1) {
                                if (Ibf == 15) {
                                    flag = 3, Esj = 126.22;
                                }
                            }
                            if (flag != 1 && flag != 3) {
                                if (15.70 <= Ibf && Ibf <= 31.80) {
                                    MIbf = (-0.1863), AT = (27.9260);
                                }
                                if (31.80 < Ibf && Ibf < 44.10) {
                                    MIbf = (-1.5504), AT = (71.3030);
                                }
                                if (44.10 <= Ibf && Ibf <= 65.90) {
                                    Esd = 12.300, flag = (2);
                                }
                                if (65.90 < Ibf) {
                                    MIbf = (-0.0631), AT = (7.0878);
                                }
                            }
                            break;
                            // <!--
                        case 20:
                            if (Ibf < 22.60) {
                                flag = 1;
                            }
                            if (flag != 1) {
                                if (22.60 <= Ibf && Ibf <= 65.9) {
                                    MIbf = (-0.1284), AT = (32.262);
                                }
                                if (65.90 < Ibf) {
                                    MIbf = (-0.5177), AT = (57.917);
                                }
                            }
                            break;
                            // <!--
                    }
                    // <!--
                    if (flag == 0) {
                        Ejf = CM * ((MIbf * CIbf) + AT);
                    }
                    if (flag == 1) {
                        Ejf = 418.7;
                    }
                    if (flag == 2) {
                        Ejf = Esd;
                    }
                    if (flag == 3) {
                        Ejf = Esj;
                    }
                    // <!--
                    // <!-- ======================================================================
                    // <!-- For Circuit Breakers --
                    {
                        ptr4 = 0
                    }
                    if (pass == 2) {
                        if (100 <= rating && rating <= 405) {
                            ptr4 = 1;
                        }
                        if (600 <= rating && rating <= 1205) {
                            ptr4 = 2;
                        }
                        if (1600 <= rating && rating <= 2005) {
                            ptr4 = 3;
                        }
                    }
                    // <!--
                    switch (ptr4) {
                        // <!--
                        case 1:
                            if (volts <= 480) {
                                MIbf = (0.189), AT = (0.548), BMIbf = (9.16), BAT = (194);
                            }
                            if (480 < volts && volts <= 605) {
                                MIbf = (0.271), AT = (0.180), BMIbf = (11.80), BAT = (196);
                            }
                            break;
                            // <!--
                        case 2:
                            if (volts <= 480) {
                                MIbf = (0.223), AT = (1.590), BMIbf = (8.45), BAT = (364);
                            }
                            if (480 < volts && volts <= 605) {
                                MIbf = (0.335), AT = (0.380), BMIbf = (11.40), BAT = (369);
                            }
                            break;
                            // <!--
                        case 3:
                            if (volts <= 480) {
                                MIbf = (0.448), AT = (3.000), BMIbf = (11.10), BAT = (696);
                            }
                            if (480 < volts && volts <= 605) {
                                MIbf = (0.686), AT = (0.165), BMIbf = (16.70), BAT = (606);
                            }
                            break;
                            // <!-- 
                    }
                    {
                        CBdistancem = ((BMIbf * CIbf) + BAT);
                    }
                    // <!--
                    // <!-- ======================================================================
                    // <!-- COMPUTATIONS
                    // <!-- =================================
                    // <!-- For Arcing Time
                    // <!-- For Circuit Breakers
                    // <!-- Circuit Breaker Opening Time (Seconds)
                    if (pass == 2) {
                        if (Crating <= 400) {
                            CBtime = (0.0265);
                        }
                        if (Crating == 600) {
                            CBtime = (0.0454);
                        }
                        if (Crating >= 800) {
                            CBtime = (0.650);
                        }
                    }
                    // <!-- =================================
                    // <!-- For Computing Normalized Incident Energy  (NIenergy)
                    // <!-- Normalized Arcing Time = 0.200 Seconds;
                    // <!-- Normalized Distance = 610 mm (24in)
                    {
                        k2 = 0;
                    }
                    {
                        LgNEinc = (-0.555) + (k2) + (1.081 * (Lgiarc)) + (0.0011 * Ngap);
                    }
                    {
                        NIenergy = Math.pow(10, LgNEinc);
                    }
                    {
                        i = Math.pow(610, P);
                    }
                    {
                        j = Math.pow(distance, P);
                    }
                    // <!-- ======================================================================
                    // <!-- For computing Incident Energy
                    if (pass == 2) {
                        {
                            Ctime = CBtime;
                        }
                        {
                            JIenergy = (4.184 * (CF) * (NIenergy) * (Ctime / 0.2) * (i / j));
                        }
                    }
                    //Main Eq for computing CB Inc/Energy!
                    if (pass == 2) {
                        {
                            FOtime = Ctime;
                        }
                        {
                            Ecb = JIenergy;
                        }
                        {
                            IBenergy = 1.2;
                        }
                        {
                            FBdistancem = Math.pow((4.184 * CF * NIenergy * (FOtime / 0.2) * (i / IBenergy)), (1 / P));
                        }
                    }
                    // <!-- ======================================================================
                    if (pass == 1) {
                        JIenergy = Ejf;
                    }
                    if (pass == 2) {
                        {
                            Eflag = 0;
                        }
                        if (rating <= 100 && Ibf < 2) {
                            Eflag = 1;
                        }
                        if (rating == 200 && Ibf < 4) {
                            Eflag = 1;
                        }
                        if (rating == 400 && Ibf < 6) {
                            Eflag = 1;
                        }
                        if (rating == 600 && Ibf < 12) {
                            Eflag = 1;
                        }
                        if (rating == 800 && Ibf < 10) {
                            Eflag = 1;
                        }
                        if (rating == 1200 && Ibf < 14) {
                            Eflag = 1;
                        }
                        if (rating == 1600 && Ibf < 20) {
                            Eflag = 1;
                        }
                        if (rating == 2000 && Ibf < 25) {
                            Eflag = 1;
                        }
                        if (Eflag == 1) {
                            JIenergy = 418.7;
                        } else {
                            JIenergy = Ecb;
                        }
                    }
                    // <!-- Formatting Energy Output
                    {
                        CIenergy = (JIenergy * jccf);
                    }
                    if (pass == 1) {
                        {
                            EF = CIenergy;
                        }
                        {
                            EincF = CIenergy;
                        }
                        if (EincF >= 100) {
                            EincF = ">" + 100, F1 = 1;
                        }
                        if (EincF <= 0.25) {
                            EincF = 0.25;
                        }
                        {
                            EincF = (EincF + ".");
                        }
                        {
                            indx = "";
                        }
                        {
                            indx = (EincF.indexOf("."));
                        }
                        if (indx == 1) {
                            EincF = (EincF.substring(0, 4));
                        }
                        if (indx == 2) {
                            EincF = (EincF.substring(0, 5));
                        }
                        if (indx == 3) {
                            EincF = (EincF.substring(0, 6));
                        }
                    }
                    // <!--
                    if (pass == 2) {
                        {
                            EC = CIenergy;
                        }
                        {
                            EincCB = CIenergy;
                        }
                        if (EincCB >= 100) {
                            EincCB = ">" + 100, C1 = 1;
                        }
                        if (EincCB <= 0.25) {
                            EincCB = 0.25;
                        }
                        {
                            EC = EincCB;
                        }
                        {
                            EincCB = (EincCB + ".");
                        }
                        {
                            indx = "";
                        }
                        {
                            indx = (EincCB.indexOf("."));
                        }
                        if (indx == 1) {
                            EincCB = (EincCB.substring(0, 4));
                        }
                        if (indx == 2) {
                            EincCB = (EincCB.substring(0, 5));
                        }
                        if (indx == 3) {
                            EincCB = (EincCB.substring(0, 6));
                        }
                    }
                    // <!--
                    // <!-- ======================================================================
                    // <!-- For Flash Protection Boundary
                    {
                        i = Math.pow(610, P);
                    }
                    {
                        j = Math.pow(distance, P);
                    }
                    // <!-- For Normalized Incident Energy
                    {
                        k2 = 0;
                    }
                    {
                        LgNEinc = (-0.555) + (k2) + (1.081 * (Lgiarc)) + (0.0011 * Ngap);
                    }
                    {
                        NIenergy = Math.pow(10, LgNEinc);
                    }
                    // <!--
                    // <!-- ======================================================================
                    // <!-- For Computing Manual Distance Adjustments --
                    // <!-- For Fuses
                    if (pass == 1) {
                        Einc = Ejf;
                    }
                    if (distance != 457.2) {
                        if (distance == 304.8) {
                            DM1 = 2.298;
                        }
                        if (distance == 381) {
                            DM1 = 1.44;
                        }
                        if (distance == 508) {
                            DM1 = 0.811;
                        }
                        if (distance == 609.6) {
                            DM1 = 0.565;
                        }
                        if (distance == 762) {
                            DM1 = 0.363;
                        }
                        if (distance == 914.4) {
                            DM1 = 0.25;
                        }
                        {
                            maflg = 1;
                        }
                        {
                            Z1 = (DM1 * Ejf);
                        }
                        if (Z1 < 1.05) {
                            Z1 = 1.05;
                        }
                        //if (Z1 > 168) {PF = 1;}
                        if (Z1 > 417.5) {
                            F1 = 1;
                        }
                        {
                            Einc = Z1;
                        }
                        {
                            EincF = Z1;
                        }
                        {
                            EincF = (EincF * 0.23889);
                        }
                        {
                            DEf = EincF;
                        }
                        {
                            EincF = (EincF + ".");
                        }
                        {
                            indx = "";
                        }
                        {
                            indx = (EincF.indexOf("."));
                        }
                        if (indx == 1) {
                            EincF = (EincF.substring(0, 4));
                        }
                        if (indx == 2) {
                            EincF = (EincF.substring(0, 5));
                        }
                        if (indx == 3) {
                            EincF = (EincF.substring(0, 6));
                        }
                    }
                    // <!--
                    // <!-- ======================================================================
                    // <!-- For Circuit Breakers --
                    if (pass == 2) {
                        Einc = JIenergy;
                    }
                    if (distance != 457.2) {
                        if (distance == 304.8) {
                            DM2 = 2.298;
                        }
                        if (distance == 381) {
                            DM2 = 1.44;
                        }
                        if (distance == 508) {
                            DM2 = 0.811;
                        }
                        if (distance == 609.6) {
                            DM2 = 0.565;
                        }
                        if (distance == 762) {
                            DM2 = 0.363;
                        }
                        if (distance == 914.4) {
                            DM2 = 0.25;
                        }
                        {
                            maflg = 1;
                        }
                        {
                            Z2 = (DM2 * JIenergy);
                        }
                        if (Z2 < 1.05) {
                            Z2 = 1.05;
                        }
                        //if (Z2 > 168) {PC = 1;}
                        if (Z2 > 417.5) {
                            C1 = 1;
                        }
                        {
                            Einc = Z2;
                        }
                        {
                            EincCB = Z2;
                        }
                        {
                            EincCB = (EincCB * 0.23889);
                        }
                        {
                            DEcb = EincCB;
                        }
                        {
                            EincCB = (EincCB + ".");
                        }
                        {
                            indx = "";
                        }
                        {
                            indx = (EincCB.indexOf("."));
                        }
                        if (indx == 1) {
                            EincCB = (EincCB.substring(0, 4));
                        }
                        if (indx == 2) {
                            EincCB = (EincCB.substring(0, 5));
                        }
                        if (indx == 3) {
                            EincCB = (EincCB.substring(0, 6));
                        }
                    }
                    // <!--
                    // <!-- ======================================================================
                    // <!-- Boundary Distance Curve Table --
                    if (Einc <= 1.046) {
                        (PBdist = 153);
                    }
                    if (Einc > 1.046 && Einc <= 1.382) {
                        (PBdist = 153);
                    }
                    if (Einc > 1.382 && Einc <= 1.632) {
                        (PBdist = 157.5);
                    }
                    if (Einc > 1.632 && Einc <= 1.674) {
                        (PBdist = 177.8);
                    }
                    if (Einc > 1.674 && Einc <= 1.80) {
                        (PBdist = 193.4);
                    }
                    if (Einc > 1.80 && Einc <= 2.01) {
                        (PBdist = 227.83);
                    }
                    if (Einc > 2.01 && Einc <= 2.637) {
                        (PBdist = 254.5);
                    }
                    if (Einc > 2.637 && Einc <= 2.721) {
                        (PBdist = 301.5);
                    }
                    if (Einc > 2.721 && Einc <= 2.88) {
                        (PBdist = 312);
                    }
                    if (Einc > 2.88 && Einc <= 3.348) {
                        (PBdist = 347.22);
                    }
                    if (Einc > 3.348 && Einc <= 4.94) {
                        (PBdist = 453);
                    }
                    if (Einc > 4.94 && Einc <= 6.028) {
                        (PBdist = 517.8);
                    }
                    if (Einc > 6.028 && Einc <= 6.53) {
                        (PBdist = 546.2);
                    }
                    if (Einc > 6.53 && Einc <= 8.121) {
                        (PBdist = 633.5);
                    }
                    if (Einc > 8.121 && Einc <= 8.75) {
                        (PBdist = 666.25);
                    }
                    if (Einc > 8.75 && Einc <= 9.711) {
                        (PBdist = 715.26);
                    }
                    if (Einc > 9.711 && Einc <= 11.300) {
                        (PBdist = 793);
                    }
                    if (Einc > 11.300 && Einc <= 12.90) {
                        (PBdist = 867);
                    }
                    if (Einc > 12.90 && Einc <= 14.50) {
                        (PBdist = 938.3);
                    }
                    if (Einc > 14.50 && Einc <= 16.07) {
                        (PBdist = 1007);
                    }
                    if (Einc > 16.07 && Einc <= 17.66) {
                        (PBdist = 1073.6);
                    }
                    if (Einc > 17.66 && Einc <= 19.25) {
                        (PBdist = 1138.5);
                    }
                    if (Einc > 19.25 && Einc <= 20.85) {
                        (PBdist = 1201.4);
                    }
                    if (Einc > 20.85 && Einc <= 22.43) {
                        (PBdist = 1262.9);
                    }
                    if (Einc > 22.43 && Einc <= 25.58) {
                        (PBdist = 1380);
                    }
                    if (Einc > 25.58 && Einc <= 28.75) {
                        (PBdist = 1494.8);
                    }
                    if (Einc > 28.75 && Einc <= 31.94) {
                        (PBdist = 1605.5);
                    }
                    if (Einc > 31.94 && Einc <= 33.36) {
                        (PBdist = 1653.5);
                    }
                    if (Einc > 33.36 && Einc <= 38.85) {
                        (PBdist = 1833);
                    }
                    if (Einc > 38.85 && Einc <= 44.28) {
                        (PBdist = 2006);
                    }
                    if (Einc > 44.28 && Einc <= 49.80) {
                        (PBdist = 2169);
                    }
                    if (Einc > 49.80 && Einc <= 55.25) {
                        (PBdist = 2329);
                    }
                    if (Einc > 55.25 && Einc <= 58.60) {
                        (PBdist = 2413);
                    }
                    if (Einc > 58.60 && Einc <= 65.50) {
                        (PBdist = 2540);
                    }
                    if (Einc > 65.50 && Einc <= 72.60) {
                        (PBdist = 2794);
                    }
                    if (Einc > 72.60 && Einc <= 86.80) {
                        (PBdist = 3049);
                    }
                    if (Einc > 86.80) {
                        PBdist = (3049);
                    }
                    // <!--
                    if (pass == 1) {
                        Fdist = PBdist;
                    }
                    if (pass == 2) {
                        Cdist = PBdist;
                    }
                    // <!--
                    // <!-- ======================================================================
                    // <!-- Conversion to Inches for Display
                    if (pass == 1) {
                        Fdist = PBdist * 0.03937;
                    }
                    {
                        Fdist = Math.ceil(Fdist);
                    }
                    if (pass == 2) {
                        Cdist = PBdist * 0.03937;
                    }
                    {
                        Cdist = Math.ceil(Cdist);
                    }
                    // <!-- =====================================
                    // <!-- For PPE Levels
                    if (pass == 1) {
                        CIenergy = EincF;
                    }
                    if (pass == 2) {
                        CIenergy = EincCB;
                    }
                    // <!--
                    if (0 <= CIenergy && CIenergy <= 1.2) {
                        PPE = 1.2;
                    }
                    if (1.2 < CIenergy && CIenergy <= 5) {
                        PPE = 5;
                    }
                    if (5 < CIenergy && CIenergy <= 8) {
                        PPE = 8;
                    }
                    if (8 < CIenergy && CIenergy <= 25) {
                        PPE = 25;
                    }
                    if (25 < CIenergy && CIenergy <= 40) {
                        PPE = 40;
                    }
                    if (40 < CIenergy) {
                        PPE = ">" + 40;
                    }
                    // <!--
                    if (pass == 1) {
                        PPEF = PPE;
                    }
                    if (pass == 2) {
                        PPEC = PPE;
                    }
                    // <!-- End PPE Levels
                    // <!-- For Hazard Level
                    if (0 <= CIenergy && CIenergy <= 1.2) {
                        HL = 0;
                    }
                    if (1.2 < CIenergy && CIenergy <= 5) {
                        HL = 1;
                    }
                    if (5 < CIenergy && CIenergy <= 8) {
                        HL = 2;
                    }
                    if (8 < CIenergy && CIenergy <= 25) {
                        HL = 3;
                    }
                    if (25 < CIenergy && CIenergy <= 40) {
                        HL = 4;
                    }
                    if (40 < CIenergy) {
                        HL = (">" + 4);
                    }

                    if (pass == 1) {
                        HRCF = HL;
                    }
                    if (pass == 2) {
                        HRCC = HL;
                    }
                    // <!-- End Hazard Level
                    // <!-- ======================================================================
                    {
                        pass = (pass + 1);
                    }
                } while (pass < 3);
                // <!-- End Two-Pass Loop --
                // <!-- ======================================================================
                if (EincF <= 0.25) {
                    Fdist = 6;
                }
                if (EincCB <= 0.25) {
                    Cdist = 6;
                }

                if (F1 == 1) {
                    Fdist = ">" + 120, PPEF = ">" + 40, HRCF = ">" + 4;
                }
                if (C1 == 1) {
                    Cdist = ">" + 120, PPEC = ">" + 40, HRCC = ">" + 4;
                }
                // <!-- ======================================================================
                // <!-- Output Assignments
                {
                    EincF = (pad2 + EincF);
                }
                {
                    EincCB = (pad2 + EincCB);
                }
                // <!--
                if (F1 != 1) {
                    {
                        if (Fdist < 10) {
                            Fdist = (pad5 + Fdist);
                        }
                        if (Fdist >= 10 && Fdist <= 130) {
                            Fdist = (pad3 + Fdist);
                        }
                    }
                    if (PPEF < 10) {
                        PPEF = (pad5 + PPEF);
                    }
                    if (PPEF >= 10 && PPEF <= 100) {
                        PPEF = (pad3 + PPEF);
                    }
                    if (PPEF == ">40") {
                        PPEF = (pad2 + PPEF);
                    }
                    {
                        HRCF = (pad4 + HRCF);
                    }
                } else {
                    Fdist = (pad2 + Fdist), PPEF = (pad2 + PPEF), HRCF = (pad4 + HRCF);
                }
                // <!--
                if (C1 != 1) {
                    {
                        if (Cdist < 10) {
                            Cdist = (pad5 + Cdist);
                        }
                        if (Cdist >= 10 && Cdist <= 130) {
                            Cdist = (pad3 + Cdist);
                        }
                    }
                    if (PPEC < 10) {
                        PPEC = (pad5 + PPEC);
                    }
                    if (PPEC >= 10 && PPEC <= 100) {
                        PPEC = (pad3 + PPEC);
                    }
                    if (PPEC == ">40") {
                        PPEC = (pad2 + PPEC);
                    }
                    {
                        HRCC = (pad4 + HRCC);
                    }
                } else {
                    Cdist = (pad2 + Cdist), PPEC = (pad2 + PPEC), HRCC = (pad4 + HRCC);
                }
                // <!--
                $('input[name="textfield1"]').val(EincF);
                $('input[name="textfield2"]').val(EincCB);
                $('input[name="textfield3"]').val(Fdist);
                $('input[name="textfield4"]').val(Cdist);
                $('input[name="textfield5"]').val(PPEF);
                $('input[name="textfield6"]').val(PPEC);
                $('input[name="textfield7"]').val(HRCF);
                $('input[name="textfield8"]').val(HRCC);
                // <!-- ======================================================================
                // <!-- Warning Statements
                if (maflg == 0) {
                    if (F1 == 1 && C1 == 1) {

                        displayCalcWarning(warn6);
                    }
                    if (F1 == 1 && C1 != 1) {

                        $('#gpOutputsWarning').fadeIn(500, function() {
                        });
                        displayCalcWarning(warn5);
                    }
                    if (F1 != 1 && C1 == 1) {
                        $('#gpOutputsWarning').fadeIn(500, function() {
                        });
                        displayCalcWarning(warn4);
                    }
                    if (40 < EincF && EincCB <= 100) {
                        $('#gpOutputsWarning').fadeIn(500, function() {
                        });
                        displayCalcWarning(warn7 + warn2);
                    }
                    if (40 < EincCB && EincF <= 100) {
                        $('#gpOutputsWarning').fadeIn(500, function() {
                        });
                        displayCalcWarning(warn8 + warn2);
                    }
                }
                if (maflg == 1) {
                    if (100 < DEf) {
                        F2 = 1;
                    }
                    if (100 < DEcb) {
                        C2 = 1;
                    }
                    if (F2 == 1 && C2 == 1) {
                        displayCalcWarning(warn6);
                    }
                    if (F2 == 1 && C2 != 1) {
                        displayCalcWarning(warn5);
                    }
                    if (F2 != 1 && C2 == 1) {

                        displayCalcWarning(warn4);



                    }
                    if (40 < DEf && DEf <= 100) {

                        displayCalcWarning(warn7 + warn2);
                    }
                    if (40 < DEcb && DEcb <= 100) {
                        displayCalcWarning(warn8 + warn2);
                    }
                }
                // <!-- ======================================================================


// End of Function                           

//  End -->

            });


        }

    });

}(jQuery, GPWIDGET));