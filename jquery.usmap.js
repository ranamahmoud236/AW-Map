// create inline function and give it its parameters 
(function($, document, window, Raphael, undefined) {
  // jQuery Plugin Factory
  function jQueryPluginFactory( $, name, methods, getters ){
    getters = getters instanceof Array ? getters : [];
    var getters_obj = {};
    for(var i=0; i<getters.length; i++){
      getters_obj[getters[i]] = true;
    }
  
    
    // Create the object
    var Plugin = function(element){
      this.element = element;
    };
    Plugin.prototype = methods;
    
    // Assign the plugin
    $.fn[name] = function(){
      var args = arguments;
      var returnValue = this;
      
      this.each(function() {
        var $this = $(this);
        var plugin = $this.data('plugin-'+name);
        // Init the plugin if first time
        if( !plugin ){
          plugin = new Plugin($this);
          $this.data('plugin-'+name, plugin);
          if(plugin._init){
            plugin._init.apply(plugin, args);
          }
          
        // call a method
        } else if(typeof args[0] == 'string' && args[0].charAt(0) != '_' && typeof plugin[args[0]] == 'function'){
          var methodArgs = Array.prototype.slice.call(args, 1);
          var r = plugin[args[0]].apply(plugin, methodArgs);
          // set the return value if method is a getter
          if( args[0] in getters_obj ){
            returnValue = r;
          }
        }
        
      });
      
      return returnValue; // returning the jQuery object
    };
  };
  
  
  // define some constant, The daimintions of the Map 
  // define the Default style
  // Some constants
  var WIDTH = 1830,
      HEIGHT = 630,
      LABELS_WIDTH = 70;
  
  // Default options
  var defaults = {
    // The styles for the state
    'stateStyles': {
      fill: "#333",
      stroke: "#666",
      "stroke-width": 1,
      "stroke-linejoin": "round",
      scale: [1, 1]
    },
    
    // The styles for the hover
    'stateHoverStyles': {
      fill: "#33c",
      stroke: "#000",
      scale: [1.1, 1.1]
    },
    
    // The time for the animation, set to false to remove the animation
    'stateHoverAnimation': 500,
    
    // State specific styles. 'ST': {}
    'stateSpecificStyles': {},
    
    // State specific hover styles
    'stateSpecificHoverStyles': {},
    
    
    // Events
    'click': null,
    
    'mouseover': null,
    
    'mouseout': null,
    
    'clickState': {},
    
    'mouseoverState': {},
    
    'mouseoutState': {},
    
    
    // Labels
    'showLabels' : true,
    
    'labelWidth': 20,
    
    'labelHeight': 15,
    
    'labelGap' : 6,
    
    'labelRadius' : 3,
    
    'labelBackingStyles': {
      fill: "#333",
      stroke: "#666",
      "stroke-width": 1,
      "stroke-linejoin": "round",
      scale: [1, 1]
    },
   
    // The styles for the hover
    'labelBackingHoverStyles': {
      fill: "#33c",
      stroke: "#000"
    },
    
    'stateSpecificLabelBackingStyles': {},
    
    'stateSpecificLabelBackingHoverStyles': {},
    
    'labelTextStyles': {
      fill: "#fff",
      'stroke': 'none',
      'font-weight': 300,
      'stroke-width': 0,
      'font-size': '10px'
    },
    
    // The styles for the hover
    'labelTextHoverStyles': {},
    
    'stateSpecificLabelTextStyles': {},
    
    'stateSpecificLabelTextHoverStyles': {}
  };
  
  
  // Methods
  var methods = {
    /**
     * The init function
     */
    _init: function(options) {
      // Save the options
      this.options = {};
      // call the extend function in JQuery to merge the content of parameters and save it in the first one.
      $.extend(this.options, defaults, options);
      
      // Save the width and height;
      var width = this.element.width();
      var height = this.element.height();
      
      // Calculate the width and height to match the container while keeping the labels at a fixed size
      var xscale = this.element.width()/WIDTH;
      var yscale = this.element.height()/HEIGHT;
      this.scale = Math.min(xscale, yscale);
      this.labelAreaWidth = Math.ceil(LABELS_WIDTH/this.scale); // The actual width with the labels reversed scaled
      
      var paperWidthWithLabels = WIDTH + Math.max(0, this.labelAreaWidth - LABELS_WIDTH);
      // Create the Raphael instances
      this.paper = Raphael(this.element.get(0), paperWidthWithLabels, HEIGHT);//this.element.width(), this.element.height());
      
      // Scale to fit
      this.paper.setSize(width, height);
      this.paper.setViewBox(0, 0, paperWidthWithLabels, HEIGHT, false);
      
      // Keep track of all the states
      this.stateHitAreas = {}; // transparent for the hit area
      this.stateShapes = {}; // for the visual shape
      this.bboxesForStateShapes = {}; // bounding boxes for the shapes scaled to the map
      this.topShape = null;
      
      // create all the states
      this._initCreateStates();
      
      // create the labels for the smaller states
      this.labelShapes = {};
      this.labelTexts = {};
      this.labelHitAreas = {};
      if(this.options.showLabels) {
        this._initCreateLabels();
      }
      
      // Add the 
    },
    
    /**
     * Create the state objects
     */
    _initCreateStates: function() {
      // TODO: Dynamic attrs
      var attr = this.options.stateStyles;
      var R = this.paper; // shorter name for usage here 

      // The coords for each state
      // The SVG code for each state in the US-Map:
      var paths= {
        //PAlestine 
      PA: d="M1238.9,247.912c-1.928-7.1-17.608-34.2-14.614-38.716s14.005-39.376,18.521-40.644c.812-.254,1.573-1.523,2.334-3.552,0,0,4.872,2.283,8.626,1.776,0,0,1.167,25.472-3.044,32.576-4.212,7.155-2.081,15.527-2.943,20.145-.761,4.414-8.372,26.944-8.829,28.364Z",
      //jordan 
      JO: d="M1256.126,167.137s17.283,13.627,21.272,15.9c4.044,2.216,34.4-16.009,44.483-19.666,1.218-.443,2.714-1.108,4.487-1.939,0,0,9.2,16.121,8.753,19.334s3.213,11.91,3.213,11.91c-1.828,2.271-8.7,4.542-16.453,4.1-7.811-.443-33.4,7.312-33.847,9.14s15.067,16.01,19.222,21.494c4.1,5.485-3.711,11.91-11.466,15.123-7.756,3.158-14.182,4.543-18.392,11.412s-19.112,6.869-21.106,1.772c-1.939-4.874-15.234-.387-16.342-.055.5-1.551,8.808-26.147,9.639-30.966.942-5.041-1.384-14.182,3.213-21.993C1257.4,194.945,1256.126,167.137,1256.126,167.137Z",
      //lebanon
      LE: d="M1245.709,163.243c3.933-9.914,7.7-35.968,12.962-38.243,0,0,11.412.271,13.738,2.925,2.272,2.708,7.756,10.292,0,14.3-7.81,4.063-10.58,16.576-13.738,21.018a4.732,4.732,0,0,1-3.545,1.9C1251.027,165.68,1245.709,163.243,1245.709,163.243Z",
      //iraq
      IR: d="M1349.083,190.913s-3.387-8.254-2.976-11.3S1338,161.261,1338,161.261c11.9-5.835,35.2-20.4,41.149-24.184,6.773-4.363,8.467-22.554,8.928-29.546.411-6.94.821-19.085,7.183-19.926,6.363-.894,19.908-18.243,24.167-21.713,4.207-3.47,21.6,3.891,23.7,3.049,2.1-.893,13.546,5.205,15.649,5.205,2.156,0,12.315,21.24,13.135,22.134.822.841,13.135,4.784,16.522,7.834s1.693,12.986-2.514,14.878c-4.259,1.945-7.235,11.987-8.928,14.931s-5.49,15.3-5.08,17.455c.462,2.208,11.442,3.469,13.6,7.412,2.1,3.891,1.232,9.516,3.387,10.831,2.1,1.314,19.446,10.409,25.4,12.144,5.952,1.683,8.056,17.823,4.259,25.6-3.848,7.833,3.386,13.459,6.311,16.088C1527.842,226.033,1536,239.6,1536,239.6a9.851,9.851,0,0,1-6.106-.473c-9.235-3.785-33.2,13.2-29.5,15.09,0,0-20.011,1.787-41.15,1.787-21.19,0-16.521-7.781-17.8-11.724-1.283-3.891-25.86-19.979-34.736-28.653-8.927-8.675-22.883-12.565-25.859-16.929C1377.867,194.383,1350.776,188.705,1349.083,190.913Z",
      //syria
      SY: d="M1416.281,58.942c-4.6,3.657-19.222,21.937-26.092,22.879-6.868.886-10.081,47.53-17.394,52.128-6.426,3.988-89.353,49.3-93.4,47.086-3.989-2.271-21.272-15.9-21.272-15.9a4.709,4.709,0,0,0,3.545-1.939c3.158-4.543,5.928-17.34,13.738-21.494,7.756-4.1,2.272-11.855,0-14.624-2.326-2.715-13.738-2.992-13.738-2.992,5.651-2.493,12.963-35.287,6.98-44.815,0,0,48.084-4.1,51.02-6.592C1322.662,70.243,1382.1,71.794,1416.281,58.942Z",
      //yaman
      YA: d="M1640.7,554.424v.055c-9.473,3.767-17.284,7.811-18.558,10.248-2.991,5.706-34.844,31.133-47.806,31.133-12.908,0-39.775,11.91-47.752,15.9s-30.855,14.957-44.815,12.962c-13.9-1.994-29.858,14.9-49.745,2.991-12.852-7.7-20.663-36.394-25.15-59.329,8.752-3.933,15.4-27.808,21.438-32.3,6.038-4.542,33.182,6.759,48.97,7.535,15.843.719,24.873,5.262,29.415,6.758s16.619-15.843,26.369-28.972c9.8-13.129,51.3-18.5,70.906-20,2.881-.222,6.371-.72,10.193-1.385C1614.881,501.3,1638.2,543.511,1640.7,554.424Z",
      // kingdom of saudi arabia
      KSA: d="M1242.9,257.714l.055-.055c1.108-.332,14.4-4.819,16.342.055,1.994,5.1,16.9,5.1,21.106-1.772s10.636-8.254,18.392-11.412c7.755-3.213,15.566-9.638,11.466-15.123-4.155-5.484-19.666-19.665-19.222-21.494s26.036-9.583,33.847-9.14c7.755.443,14.625-1.828,16.453-4.1,1.828-2.326,31.077,3.656,34.29,8.2,3.213,4.6,64.037,43.929,65.422,48.029,1.385,4.154-3.656,12.353,19.222,12.353,22.824,0,44.428-1.883,44.428-1.883,3.933,1.994,70.63,79.659,76.613,79.659s25.87,45.757,31.852,45.757c0,0,11.633,21.106,18.447,23.377,6.758,2.271,22.6-5.263,29.415,0,6.759,5.318,22.6-.609,24.873.443l.055.056c.555,1.385,10.47,24.54,9.75,29.692-.775,5.263-12.852,35.4-20.385,39.165-6.426,3.213-40.218,13.516-62.155,17.505-3.822.665-7.312,1.163-10.193,1.385-19.61,1.5-61.1,6.869-70.906,20-9.75,13.129-21.826,30.468-26.369,28.972s-13.572-6.039-29.415-6.758c-15.788-.776-42.932-12.077-48.97-7.535-6.038,4.488-12.686,28.363-21.438,32.3-2.548-12.741-3.989-23.654-4.709-28.251-1.994-12.963-25.87-40.827-33.847-53.79-7.977-12.907-31.852-23.876-30.856-37.835,1-13.9-58.719-106.471-73.676-132.4-14.9-25.87-29.858-16.895-35.841-16.895C1226.941,296.215,1245.055,265.47,1242.9,257.714Z",
      // united arab emirates
      UAE: d="M1705.119,349.386c.387,10.082-3.38,34.4-7.922,34.4-4.487,0-8.974,24.6-11.246,23.876l-.055-.056c-2.271-1.052-18.114,4.875-24.873-.443-6.813-5.263-22.657,2.271-29.415,0-6.814-2.271-18.447-23.377-18.447-23.377,5.983,0,26.867-6.98,35.842-7.977s22.878-10.913,27.864-20.884c4.1-8.254,20.441-11.024,28.252-5.6Z",
      //OMAN
      OM: d="M1708,354.331a9.808,9.808,0,0,1,3.6,4.6c3.989,10.969,41.824,41.825,53.79,42.822,11.91,1,23.876,14.9,21.882,22.878s-20.885,35.841-27.865,37.836-10.968,20.884-15.954,32.849-40.771,30.856-47.751,31.853-6.98,17.893-17.948,16.9c-6.316-.554-22.214,4.155-35.177,9.362-2.493-10.913-25.814-53.125-26.535-54.4,21.937-3.989,55.729-14.292,62.155-17.505,7.534-3.767,19.61-33.9,20.385-39.165.721-5.152-9.2-28.307-9.749-29.692,2.271.72,6.758-23.876,11.245-23.876,4.543,0,8.31-24.319,7.922-34.4Z",
      //QATAR
      QA: d="M1587.2,342.081l4.163-2.081h3.122s6.244-17.691,2.081-27.057-8.325-6.244-8.325-6.244L1582,316.065v21.854Z",
      //somalia
      SO: d="M1586.025,666.688c.6,2.89-2.1,3.194-4.2,2.4,5.884-5.164.945-15.546,1.7-22.085.348-3.018,2.883-7.514,1.886-10.379-.846-2.427-4.246-3.58-6.475-4.1-2.352-.555-4.976-.838-6.973.743-2.538,2.011-3.116,5.659-5.816,7.593-3.419,2.449-20.171,6.675-24.528,7.908-4.38,1.238-8-.959-12.277-.718-4.536.255-8.544,3.315-12.994,4.1-3.757.659-6.573-1.264-10.109-1.165-3.242.092-34.036,7.854-36.885,8.861-3.747,1.324-6.9,4.611-10.329,6.577-7.9,4.526-18.062,4.728-25.112-1.561-6.829-6.093-9.116-16.417-17.427-21.053-2.458,6.2-7.523,11.077-9.663,17.423-2.2,6.518,11.567,26.344,14.957,31.209,1.5,2.157,3.786,2.281,5.764,3.81,2.285,1.765,60.9,28.263,68.349,30.333,7.762,2.159,15.543.988,23.461.988l-54.124,64c-2.059,2.434-4.021,5.02-6.209,7.342-4.261,4.52-10.661,3.273-16.252,2.657-6.1-.671-11.732-.056-17.273,2.8-2.908,1.5-12.6,10.94-16.02,12.265-6.1,2.367-23.923,17.512-27.171,22.951-3.636,6.086-9.567,9.9-9.644,17.554-.192,18.868-.121,79.25.99,82.721,2.277,7.121,11.789,12.591,11.267,20.5,4.233-5.3,8.651-11.638,8.651-18.706.734,3.765,4.959-2.235,5.73-3.273,3.18-4.284,6.215-8.684,9.577-12.828,8.533-10.516,35.932-39.725,41.079-43.665,5.029-3.85,104.641-138.75,105.981-141.344,1.6-3.095,3.717-13.206,5.8-14.884a14.147,14.147,0,0,0,4.4-5.988c1.076-2.634,5.07-13.665,6.888-16.348,3.991-5.892,6.232-11.626,6.535-18.8.16-3.77-2.076-12.691,2.885-14.074,2.035-.567,7.207,1.018,7.806-1.958A12.5,12.5,0,0,1,1586.025,666.688Z",
      //egypt
      EG: d="M1251.273,375.239a12.228,12.228,0,0,0,6.1,1.2c-2.148-3.507-49.952-86.7-50.2-88.919-.236-2.1-2.65-9.69-3.67-10.7a85.144,85.144,0,0,1-12.037-14.791c-1.866-2.882-11.109-21.439-10.672-24.791a13.848,13.848,0,0,1,3.488-7.2,49.186,49.186,0,0,0,8.962,19.448,43.564,43.564,0,0,1,4.45,5.714c1.536,2.742.658,4.759,1.112,7.585.7,4.356,5.684,6.106,8.256,9.127,2.151,2.526,3.628,5.465,6.216,7.63,2.465,2.062,5.678,2.964,8.026,5.171-.609-1.93.6-3.809,1.464-5.43a13.364,13.364,0,0,0,1.7-7.031c.091-4.717,2.147-8.739,2.985-13.31.832-4.541.995-9.43,2.916-13.687,1.124-2.493,1.513-1.945.942-4.121-1.23-4.682-3.465-9.3-5.153-13.827q-3.422-9.183-6.844-18.366l-4.068-10.918c-2.808,2.477-17.839,4.866-21.109,6.978.951-4.035-14.553-4.779-18.908-5.809,4.916,2.345-1.779,3.814-1.779,5.809-.777-.739-4.643-8.4-5.527-10.813,2.768.189,4.436,3.127,6.513,4.6-1.831-1.181-2.46-3.76-4.353-4.811-2.617-1.452-4.414.677-6.9,1.187-4.787.981-18.757.67-20.677,1.822a19.572,19.572,0,0,1,6.127-4.2c-3.345-.024-6.513,3.625-9.851,1.6a8.33,8.33,0,0,1-4.351,5.207c1.115-.081,1.45.326,2.381.8a4.2,4.2,0,0,1-2.962-.8c-1.866-1.106-1.44-1.723-3.153.02a65.943,65.943,0,0,1-5.695,5.257c-4.084,3.276-8.785,5.953-14.132,4.7-4.541-1.068-18.458-4.792-20.545-5.97-2.374-1.339-1.836-2.051-4.932-2.026-2.545.021-9.325-4.5-12.5-5.308-5.762-1.472-39.14-1.487-39.32-5.888-3.933,3.3-6.413,7.214-4.974,12.431,1.226,4.446,3.318,7.893,1.779,12.624-1.671,5.138-4.905,9.146-2.521,14.6,2.222,5.083,9.841,182.355,9.957,186.8.021.844-.468,4.939.144,5.582.541.568,132.681-1.073,132.353.091,9.909,1.7,19.889.584,29.849.092,4.127-.2,18.068,8.366,21.707,6.255,3.007-1.744,10.692-10.783,13.774-13.192,3.49-2.729,8.575-12.136,10.637-12.353,1.732-.183,7.592-5.5,7.826-7.4.238-1.929-1.147-3.045-1.891-4.683C1250.075,386.535,1250.1,380.172,1251.273,375.239Z",
      //sudian
      SU: d="M1299.661,494.423c-2.116-2.35-5.864-47.9-5.6-46.845-.237-4.947-6.012-7.8-8-12.094-1.824-3.936-.134-8.222-3.989-11.341-2.25-1.82-22.562-15.29-23.97-20.787-2.26,2-11.526,5.855-13.291,7.063-1.334.913-16.5,13.912-18,18.208-3.025,8.659-12.356,1.657-17.907-.741-4.693-2.027-143.266-1.53-170.7-1.638.485,14.179,1,28.358,1.205,42.542l-20.742-.081c.478,26.606,1.57,87.383,1.637,91.165-21.7,6.5-23.21,23.939-29.691,32.5-4.194,2.937-12.453,22.955-14.031,26.309-1.1,2.329,7.541,4.073,10.153,4.722,3.845.954,5.477,13.195,5.325,15.635-.094,1.521,1.557,9.259,4.427,10.893,3.242,1.845,19.275,41.415,18.218,44.575-.978,2.92-4.664,4.475-3.949,7.791q1.1-.345,2.194-.7c.571,1.921,29.9,21.162,31.833,22.641,1.5,1.147,21.543,23.153,22.839,24.3,1.192,1.06,32.438,44.918,35.612,46.906,3.005,1.882,6.863,4.842,10.479,5.641,4.333.957,17.6-.642,20.85-2.019,2.313-.982,2.266-4.267,4.518-5.086,4.006-1.457,24.016,18.927,22.166,22.451,2.7-.548,17.115-1.1,20.2-.909,2.626.159,12.882,2.629,14.536,3.162-2.263-4.783,16.209-7.3,18-7.075,2.019.259,3.77,1.482,5.728,1.951,3.181.761,16.018-14.759,23.26-16.9,4.6-1.359,26.5-.87,32.164-1.119-1.679-1.889-3.546-3.594-3.581-6.143-.034-2.491,1.523-4.64.511-7.138-1.425-3.513-10.67-4.3-11.315-5.28-.686-1.041-1.844-1.624-2.606-2.638-1.853-2.465-2.747-5.7-3.591-8.507s-2.3-5.372-3.138-8.171-14.312-16.358-15.851-18.514c-3.561-4.986-8.284-8.946-15.013-9.988-2.276-.352-7.19-.7-8.065-3.134-.668-1.861,3.232-8.625,4.421-10.259,1.665-2.287,18.984-.715,19.743-6.521.567-4.339,3.038-42.141,5.842-44.734,2.471-2.287,6.49-.577,6.39,2.564,2.21-2.131,5.477-15.511,5.821-17.008.4-1.747,14.572-25.039,19.056-25.051,3.7-.011,7.119-5.623,4.258-4.814-13.333,3.772-2.428-68.631,13.376-80.541,2.114-1.593,33.393-26.507,32.973-28.146C1323.638,508.709,1301.42,496.378,1299.661,494.423Z",
      //morocoo
      MO: d="M491.217,159.767c-1.9-1.5-9.25-13.833-9.62-16-.347-2.03-1.713-33.322-1.92-35.039-.37-3.069-8.829-10.052-11.15-10.348-1.547-.2-13.007-4.206-14.738-3.238-2.543,1.422-36.514-.79-40.168-5.385-1.537-1.933-5.049-9.584-7.9-8.379-2.039.861-12.889,15.943-14.649,20.3-4.074,10.086-9.213,20.916-18.268,27.473-5.334,3.863-44.012,27.035-46.065,32.4-1.071,2.8-4.657,13.879-6.547,16.3-3.28,4.2-6.623,20.552-7.382,23.771-.589,2.5-2.348,4.135-.318,6.163,1.625,1.624,3.855,9.061,3.131,11.086-1.653,4.623-35.378,40.824-42.2,44.889-6.446,3.841-27.157,7.191-29.2,9.157l-.048.046a3.169,3.169,0,0,0,2.289,5.37c24.979.168,83.86,1.237,85.929-.416.81-.647.453-24.106,5.846-27.843,4.968-3.441,25.428-17.8,28.225-18.62,4.544-1.328,19.814-4.8,24.595-5.312,7.03-.752,19.928-15.31,22.968-16.932,3.159-1.684,25.134-9.542,25.591-11.914.559-2.9-4.514-13.137-3.019-14.508,2.636-2.42,18.762-11.228,21.178-12.1,5.074-1.835,23,1.036,26.373,1.254C485.824,172.048,494.513,162.372,491.217,159.767Z",
      // westren desert 
      WS: d="M238.984,283.314c-.924,4.057-8.8,20.454-12.25,23.8-3.382,3.288-7.631,5.1-11.338,7.9-3.966,3-6.319,7.466-8.179,11.968-1.943,4.7-6.7,23.881-9.062,28.085-5.349,9.532-17.033,13.8-21.654,23.968l.026-.045a1.848,1.848,0,0,1,3.274,1.692c-1.572,3.653-11.783,24.013-13.44,27.189-1.618,3.1-4.983,4.182-7.284,6.614-3.1,3.279-4.249,8.219-5.09,12.506-1.289,6.56-6.379,15.888-2.715,22.344-.751-5.06.278-13.323,6.551-13.822,3.32-.263,37.132,0,50.651,0,6.062,0,24.014.771,25.921,0,4.3-1.738,2.43-13.4,2.184-16.764-.492-6.723-2.922-15.233.511-21.472,2.313-4.2,19.353-10.283,20.953-12.557a1.517,1.517,0,0,0,.24-.8c.191-3.682,2.178-59.028,3.147-59.965.92-.89,68.051-.342,68.714-.792.484-.33.328-.241.35-.638.042-.766,1.074-30.052,1.283-36.428q.057-1.769.115-3.538Z",
      // Mauritania
      MA: d="M391.5,553.367a1.044,1.044,0,0,1-.072-.317C389.732,530.244,376.834,350.4,377.4,350.4c0,0,34.125-1.192,33.378-1.75-24.168-18.04-75.309-52.281-75.332-51.518-.117,3.885-.117,27.021-.857,28.39-.68,1.256-3.3.685-5,.705-5.361.063-62.925-.277-64.115.752-.81.7-.387,5.464-.443,6.575-.653,12.764-2.009,47.751-2.677,52.309-.286,1.951-23.186,15.259-23.008,22.164.207,8.032.861,30.4-2.96,30.406-4.316.005-75.1-.532-77.277.692-4.106,2.313-4.425,9.21-3.833,13.21.51-2.451,3.166-8.189,3.662-7.6,2.657,3.168,2.639,8.027,5.282,11.2.494.592,3.13-1.311,3.488-.529,2.023,4.416.205,30.01-1.582,30.129-.663.044,2.3,4.811,3.648,6.708,1.973,2.775,4.435,25.149,3.63,33-1.208,11.793-8.058,22.191-10.235,33.689a.97.97,0,0,0,1.838.575c1.46-3.182,3.433-6.04,6.236-5.2,1.225.366,26.239-4.234,31.8-2.976a17.555,17.555,0,0,1,8.473,4.309c1.955,1.89,3.41,4.279,5.608,5.926,2.672,2,16.8,16.655,17.923,17.706,1.475,1.382,12.725,15.627,15.444,17.039,3.86,2,8.757-.684,10.126-4.549,1.458-4.121-.035-9.112,1.923-13.043,3.366-6.756,12.469,3.543,15.907,8.321.432.6,13.935-6.311,17.218-5.34,4.668,1.38,27.607-1.3,31.873-1.56,8.357-.518,39.723-1.333,47.047-1.341,3.815-.005,16.388.551,18.306-.022C396.363,577.742,392.6,556.051,391.5,553.367Z",
        //Algira
      AL: d="M757.677,378.141c-2.18-5.616-4.059-12.45-9.79-15.037-2.94-1.328-27.639-14.1-28.512-19.183-1.083-6.3-14.366-24.019-12.493-28.446,1.836-4.341,8.454-4.536,9.515-9.584.626-2.982-1.385-63.539-4.067-69.866-1.45-3.42-6.9-12.323-4.987-14.007,3.951-3.485-4.333-32.962-6.14-40.1-.811-3.207-32.922-45.928-33.2-49.374-.311-3.894,1.258-5.74,4.075-8.124,6.232-5.277,13.767-26.394,13.366-30.6-.338-3.554-1.965-6.879-1.484-10.455.418-3.112,2.117-16.808,2.31-16.954a3.406,3.406,0,0,0-2.264-6.121c-1.953.123-17.383-5.615-19.752-3.375-1.133,1.071-1.555,2.213-3.229,2.836-2.528.941-12.457-3.857-15.076-3.667-3.153.23-1.274,3.426-4,4.684-2.337,1.076-12.449,4.121-15.287,4.981-3.906,1.183-46.023-2.684-47.237-2.8C577.659,62.8,542.62,69.4,534.1,72.688c-3.472,1.339-14.029,13.478-17.6,13.549-1.442.029-10.088,1.883-11.06,2.008-1.1.142-10.938,5.9-12.613,7.832-1.317,1.52-12.108,18.865-10.891,20.667.653.966-.471,17.163.553,20.563.39,1.293,14.107,25.807,10.012,30.633-1.381,1.627-5.292,8.1-7.136,7.935-2.979-.275-20.388-3.065-25.6-1.182-2.116.766-18.128,9.664-20.86,11.853-1.628,1.3,4.279,12.788,1.432,15.672-1.124,1.138-3.3,1.11-4.745,1.466-2.626.648-4.294,1.926-6.385,3.611-4.781,3.856-11.414,3.021-15.883,7.241-3.692,3.487-5.215,8.773-9.642,11.568-2.864,1.808-16.078,3.259-19.116,3.811s-2.871,3.009-4.826,4.929c-1.579,1.55-8.976-.106-11.038.247-2.813.482-9.764,5.1-11.8,6.315-2.312,1.383-21.167,16.912-21.23,20.472-.126,7.079-2.063,27.213-1.37,29.2.5,1.444,13.056,9.078,16.686,11.558q20.408,13.941,40.42,28.447c26.763,19.5,130.776,100.131,136.858,104.622,2.289,1.691,29.005,26.213,30.684,28.048,2.113,2.308,13.191,4.584,15.9,6.129,2.242,1.278-.729,15.8.055,18.2.914,2.8,61.588-12.354,65.589-16.835,9.626-10.782,82.545-65.61,108.786-82.361C751.91,387.222,758.4,380,757.677,378.141Z",
      //Tunisia
      TU: d="M748.923,159.991c-.606-3.217,1.221-6.569.665-9.767-.78-4.485-4.991-1.041-7.2-3.489,2.917-.344-.031-2.569-.581-3.894-.638-1.536.237-5.019-2.405-4.308-1.352.365-2.021,2.788-3.377,3.022-2.035.351-1.133-2.87-2.184-3.994-1.2-1.282-3.811.335-5.525-.332-2.55-.993-4.767-4.066-5.812-6.634-2.01-4.94,21.623-26.66,16.472-38.028a6.81,6.81,0,0,0-2.867-2.976c-2.558-1.654-4.65-2.87-6.016-5.887-2.55-5.632,7.877-16.6,9.07-18.964.923-1.83,1.555-6.351-1.627-6.346-1.686,0-7.832,6.957-9.225,7.261-.2.043-3.618-.62-3.224-1.07,1.689-1.587-.668-5.37-.938-7.059-.537-3.356-3.726-3.42-6.168-3.953,1.035,1.495-.148.421-.658-.668-.835-1.786-4.007-.576-5.223-.159-3.6,1.234-12.284,7.394-13.992,7.919-2.429.745-8.337,8.27-10.664,11.193,4.518.978,3.184,6,2.307,9.4a15.091,15.091,0,0,0-.748,5.8c.387,3.181,1.509,5.832,1.492,9.114-.031,6.375-6.514,22.892-8.2,25.074-1.671,2.165-3.835,3.489-5.558,5.491-4.19,4.864,9.179,25.217,10.923,27.608,2.9,3.977,2.411,9.35,6.254,12.775,3.55,3.164,7.472,4.565,9.84,9.131,2.7,5.2,8.519,33.454,9.8,41.715,5.971-2.873,12.943-8.37,13.361-16.04.381-6.989-5.955-14.206,2.052-18.366,1.164-.6,3.876-4.661,4.5-5.8,1.423-2.6,13.459-7.987,15.758-10.218C751.7,165.139,749.457,162.824,748.923,159.991Z" ,
      //DJIBOUTI
      DJ: d="M1393,650h18c2.3-2.521,3.664-13.916,9-8,5.722,6.345-3-7-7-7s2-5,2-5h5s6,1-1-9-19-6-19-6S1388,610,1393,650Z",
      //Kuwait
      KU: d="M1512,266s-11-9-9-12,22-15,24-14,10,2,10,2,4,7,2,9-2,5-5,7a20.431,20.431,0,0,0-5,5s-3,1,2,3,6,3,6,3l2,4s3,0,3,1,1,4-1,4-10,3-16,1S1512,266,1512,266Z",
      // libya
      LI: d="M1036.463,466c-.542-22.9-6.348-229.386-10.186-238.414-1.469-3.456,2.841-17.1,2.382-21.362-.379-3.523-1.83-15.123.538-17.855,2.153-2.483,1.767-4.757-.074-7.4-2.251-3.235-4.716-3.763-8.547-3.733-4.416.036-28.728-5.021-30.449-6.575-2.245-2.027-.561-4.389-1.471-6.772-.925-2.42-4.33-3.049-6.476-3.971-4.223-1.815-8.364-3.815-12.967-4.448-3.66-.5-33.886,8.74-38.251,13.1-5.612,5.6-7.418,11.679-5.185,19.432.98,3.4,3.331,6.563,3.813,10.076.494,3.6-1.321,7.271-3.348,10.14-3.987,5.644-11.206,10.68-18.37,10.594-6.991-.083-11.518-6.4-16.353-10.529-5.73-4.893-35.59-11.69-43.166-13.367a19.965,19.965,0,0,1-15.573-15.437c-.719-3.177-.892-6.611-2.79-9.387-2.352-3.441-5.558-3.376-9.308-3.686-4.051-.336-29.283-11.248-33.259-10.5-4,.755-7.317,2.373-11.517,2.142-4.27-.235-7.486-1.933-11.184-3.847-3.507-1.814-7.392-2.963-10.654-5.234-.357,3.605-1.537,8.628-.822,12.172.6,2.949,2.753,4.373-.047,6.935-4,3.657-10.158,4.009-14.446,7.349-2.675,2.083-2.871,4.947-4.9,7.241-1.51,1.705-4.113,1.833-5.807,3.3-5.8,5.016,2.663,14.446-.236,20.646-3.015,6.448-7.489,9.488-13.494,12.656-1.76.929-4.608,2.265-4,4.623.3,1.174,2.191,3.025,2.87,4.126a54.942,54.942,0,0,1,3.337,6.265c3.795,8.424,4.6,16.947,3.479,26.031a32.256,32.256,0,0,0,.882,12.43c1.162,4.809-.546,8.685-1.643,13.275-.981,4.105-.277,7.944.752,11.955.7,2.738,1.933,6.1.361,8.772-2.315,3.938-8.51,4.336-9.323,9.6-.863,5.573,5.54,10.491,8.415,14.51a24.254,24.254,0,0,1,4.053,8.252c.756,3.175,30.6,24.088,32.683,26.282,4.234,4.463,4.254,12.607,9.524,15.876,3.1,1.923,34.434,11.12,39.419,16.4,2.463,2.609,4.959,5.389,8.589,3.9,7.548-3.1,35.584-17.48,36.474-17.412,1.776.136,149.418,84.566,155.013,87.732l10.852,6.143c-.348-4-.2-8.014-.389-12.017Z",

    }

      var statesName=['Palestine' , 'Jordan' , 'Lebanon' , 'Iraq','Syria', 'Yaman' , 'Kingdom of Saudi Arabia', 'United Arab Emirates' ,
                        'Oman', 'Qatar', 'Somalia' , 'Egypt' , 'Sudian' ,'Morocoo' , 'Westren Desert' , 'Mauritania', 'Algira' , 'Tunisia' ,
                        'Djibouti', 'Kuwait' , 'Libya'
                      ] ;
      
      
                  
     /* function addSpan(){
        var span = document.createElement("span");
        span.innerHTML = statesName[i];
        span.style.color= "#ff0000";
      }*/
      // Create the actual objects
      var stateAttr = {};
      // Draw each state on the HTML page 
      for(var state in paths) {
        stateAttr = {};
        if(this.options.stateSpecificStyles[state]) {
          $.extend(stateAttr, attr, this.options.stateSpecificStyles[state]);
        } else {
          stateAttr = attr;
        }
        this.stateShapes[state] = R.path(paths[state]).attr(stateAttr);
        this.topShape = this.stateShapes[state];
        // this.addSpan = this.stateName[state];
        this.stateHitAreas[state] = R.path(paths[state]).attr({fill: "#000",
      "stroke-width": 0, "opacity" : 0.0, 'cursor': 'pointer'});
        this.stateHitAreas[state].node.dataState = state;
      }


     

      
      // Bind events
      // Define the events that happen on HTML page 
      this._onClickProxy = $.proxy(this, '_onClick');
      this._onMouseOverProxy = $.proxy(this, '_onMouseOver'),
      this._onMouseOutProxy = $.proxy(this, '_onMouseOut');
        // ADD the events for each state to write the ID on the alert area
      for(var state in this.stateHitAreas) {
        this.stateHitAreas[state].toFront();
        $(this.stateHitAreas[state].node).bind('mouseout', this._onMouseOutProxy);
        $(this.stateHitAreas[state].node).bind('click', this._onClickProxy);
        $(this.stateHitAreas[state].node).bind('mouseover', this._onMouseOverProxy);
        
      }
      
      
      // Create the bounding boxes for the shapes
      // create the bounded box for small states
      for(var state in this.stateShapes) {
        var bbox = this.stateShapes[state].getBBox();
        for(var v in bbox) {
          if( $.isNumeric(bbox[v]) ) {
            bbox[v] = bbox[v] * this.scale;
          }
        }
        this.bboxesForStateShapes[state] = bbox;
      }
    },
    
    
    
    
    /**
     * Create the labels
     */
    _initCreateLabels: function() {
      var R = this.paper; // shorter name for usage here
      var neStates = ['PA', 'LE', 'QA', 'KU', 'DJ'];
      // calculate the values for placing items
      var neBoxX = 1700;
      var neBoxY = 220;
      var oWidth = this.options.labelWidth;
      var oHeight = this.options.labelHeight;
      var oGap = this.options.labelGap;
      var oRadius = this.options.labelRadius;
      
      var shapeWidth = oWidth/this.scale;
      var shapeHeight = oHeight/this.scale;
      
      var colWidth = (oWidth+oGap)/this.scale;
      var downBy = (oHeight+oGap)/this.scale*0.5;
      
      var shapeRadius = oRadius/this.scale;
      
      // Styling information
      var backingAttr = this.options.labelBackingStyles;
      var textAttr = this.options.labelTextStyles;
      var stateAttr = {};


      // NE States
      for(var i=0, x, y, state; i<neStates.length; ++i) {
        state = neStates[i];
        
        // position
        x = ((i+1)%2) * colWidth + neBoxX;
        y = i*downBy + neBoxY;
        
        // attributes for styling the backing
        stateAttr = {};
        if(this.options.stateSpecificLabelBackingStyles[state]) {
          $.extend(stateAttr, backingAttr, this.options.stateSpecificLabelBackingStyles[state]);
        } else {
          stateAttr = backingAttr;
        }
        
        // add the backing
        this.labelShapes[state] = R.rect(x, y, shapeWidth, shapeHeight, shapeRadius).attr(stateAttr);
        
        // attributes for styling the text
        stateAttr = {};
        if(this.options.stateSpecificLabelTextStyles[state]) {
          $.extend(stateAttr, textAttr, this.options.stateSpecificLabelTextStyles[state]);
        } else {
          $.extend(stateAttr, textAttr);
        }
        
        // adjust font-size
        if(stateAttr['font-size']) {
          stateAttr['font-size'] = (parseInt(stateAttr['font-size'])/this.scale) + 'px';
        }
        
        // add the text
        this.labelTexts[state] = R.text(x+(shapeWidth/2), y+(shapeHeight/2), state).attr(stateAttr);
        
        // Create the hit areas
        this.labelHitAreas[state] = R.rect(x, y, shapeWidth, shapeHeight, shapeRadius).attr({
          fill: "#000",
          "stroke-width": 0, 
          "opacity" : 0.0, 
          'cursor': 'pointer'
        });
        this.labelHitAreas[state].node.dataState = state;
      }
      
      
      
      // Bind events
      for(var state in this.labelHitAreas) {
        this.labelHitAreas[state].toFront();
        $(this.labelHitAreas[state].node).bind('mouseout', this._onMouseOutProxy);
        $(this.labelHitAreas[state].node).bind('click', this._onClickProxy);
        $(this.labelHitAreas[state].node).bind('mouseover', this._onMouseOverProxy);
      }
    },
    
    
    
    /**
     * Get the state Raphael object
     */
    _getStateFromEvent: function(event) {
      // first get the state name
      var stateName = (event.target && event.target.dataState) || (event.dataState);
      return this._getState(stateName);
    },
    
    
    /**
     *
     */
    
     // Define function to get the state name , and give the value for parameters 
    _getState: function(stateName) {
      var stateShape = this.stateShapes[stateName];
      var stateHitArea = this.stateHitAreas[stateName];
      var labelBacking = stateName in this.labelShapes ? this.labelShapes[stateName] : null;
      var labelText = stateName in this.labelTexts ? this.labelTexts[stateName] : null;
      var labelHitArea = stateName in this.labelHitAreas ? this.labelHitAreas[stateName] : null
      var bbox = this.bboxesForStateShapes[stateName];
      
      return {
        shape: stateShape, 
        hitArea: stateHitArea, 
        name: stateName, 
        labelBacking: labelBacking, 
        labelText: labelText, 
        labelHitArea: labelHitArea,
        bbox: bbox
      };
    },
    
    
    
    /**
     * The mouseout handler
     */
    // Define the function of the mouse events 
    _onMouseOut: function(event) {
      var stateData = this._getStateFromEvent(event);
      
      // Stop if no state was found
      if(!stateData.hitArea) {
        return;
      }
      
      return !this._triggerEvent('mouseout', event, stateData);

    },
    
    
    /**
     *
     */
    _defaultMouseOutAction: function(stateData) {
      // hover effect
      // ... state shape
      var attrs = {};
      if(this.options.stateSpecificStyles[stateData.name]) {
        $.extend(attrs, this.options.stateStyles, this.options.stateSpecificStyles[stateData.name]);
      } else {
        attrs = this.options.stateStyles;
      }
      
      stateData.shape.animate(attrs, this.options.stateHoverAnimation);
      
      
      // ... for the label backing
      if(stateData.labelBacking) {
        var attrs = {};
        
        if(this.options.stateSpecificLabelBackingStyles[stateData.name]) {
          $.extend(attrs, this.options.labelBackingStyles, this.options.stateSpecificLabelBackingStyles[stateData.name]);
        } else {
          attrs = this.options.labelBackingStyles;
        }
        
        stateData.labelBacking.animate(attrs, this.options.stateHoverAnimation);
      }
    },

    
    
    /**
     * The click handler
     */
    _onClick: function(event) {
      var stateData = this._getStateFromEvent(event);
      
      // Stop if no state was found
      if(!stateData.hitArea) {
        return;
      }
      
      return !this._triggerEvent('click', event, stateData);
    },
    
    
    
    /**
     * The mouseover handler
     */
    _onMouseOver: function(event) {
      var stateData = this._getStateFromEvent(event);
      
      // Stop if no state was found
      if(!stateData.hitArea) {
        return;
      }
      
      return !this._triggerEvent('mouseover', event, stateData);
    },
    
    
    
    /**
     * The default on hover action for a state
     */
    _defaultMouseOverAction: function(stateData) {
      // hover effect
      this.bringShapeToFront(stateData.shape);
      this.paper.safari();
      
      // ... for the state
      var attrs = {};
      if(this.options.stateSpecificHoverStyles[stateData.name]) {
        $.extend(attrs, this.options.stateHoverStyles, this.options.stateSpecificHoverStyles[stateData.name]);
      } else {
        attrs = this.options.stateHoverStyles;
      }
      
      stateData.shape.animate(attrs, this.options.stateHoverAnimation);
      
      // ... for the label backing
      if(stateData.labelBacking) {
        var attrs = {};
        
        if(this.options.stateSpecificLabelBackingHoverStyles[stateData.name]) {
          $.extend(attrs, this.options.labelBackingHoverStyles, this.options.stateSpecificLabelBackingHoverStyles[stateData.name]);
        } else {
          attrs = this.options.labelBackingHoverStyles;
        }
        
        stateData.labelBacking.animate(attrs, this.options.stateHoverAnimation);
      }
    },
    
    
    
    
    
    
    /**
     * Trigger events
     *
     * @param type string - the type of event
     * @param event Event object - the original event object
     * @param stateData object - information about the state
     *
     * return boolean - true to continue to default action, false to prevent the default action
     */
    _triggerEvent: function(type, event, stateData) {
      var name = stateData.name;
      var defaultPrevented = false;
      
      // State specific
      var sEvent = $.Event('usmap'+type+name);
      sEvent.originalEvent = event;
      
      // Do the one in options first
      if(this.options[type+'State'][name]) {
        defaultPrevented = this.options[type+'State'][name](sEvent, stateData) === false;
      }
      
      // Then do the bounded ones
      if(sEvent.isPropagationStopped()) {
        this.element.trigger(sEvent, [stateData]);
        defaultPrevented = defaultPrevented || sEvent.isDefaultPrevented();
      }
      
      
      // General
      if(!sEvent.isPropagationStopped()) {
        var gEvent = $.Event('usmap'+type);
        gEvent.originalEvent = event;
        
        // Options handler first
        if(this.options[type]) {
          defaultPrevented = this.options[type](gEvent, stateData) === false || defaultPrevented;
        }
        
        // Bounded options next
        if(!gEvent.isPropagationStopped()) {
          this.element.trigger(gEvent, [stateData]);
          defaultPrevented = defaultPrevented || gEvent.isDefaultPrevented();
        }
      }
      
      // Do the default action
      if(!defaultPrevented) {
        switch(type) {
          case 'mouseover':
            this._defaultMouseOverAction(stateData);
            break;
          
          case 'mouseout': 
            this._defaultMouseOutAction(stateData);
            break;
        }
      }
      
      return !defaultPrevented;
    },
    
    
    /**
     *
      @param string state - The two letter state abbr
     */
    trigger: function(state, type, event) {
      type = type.replace('usmap', ''); // remove the usmap if they added it
      state = state.toUpperCase(); // ensure state is uppercase to match
      
      var stateData = this._getState(state);
      
      this._triggerEvent(type, event, stateData);
    },
    
    
    /**
     * Bring a state shape to the top of the state shapes, but not above the hit areas
     */
    bringShapeToFront: function(shape) {
      if(this.topShape) {
        shape.insertAfter(this.topShape);
      }
      this.topShape = shape;
    },
    
    /**
     * Get all the shapes used for each state for do custom bindings
     */
    getStateShapes: function() {
      if(this._getStateShapes) {
        return this._getStateShapes;
      }
      
      this._getStateShapes = {};
      
      for(var stateName in this.stateShapes) {
        this._getStateShapes[stateName] = {
          shape: this.stateShapes[stateName],
          hitArea: this.stateHitAreas[stateName],
          labelBacking: stateName in this.labelShapes ? this.labelShapes[stateName] : null,
          labelText: stateName in this.labelTexts ? this.labelTexts[stateName] : null,
          labelHitArea: stateName in this.labelHitAreas ? this.labelHitAreas[stateName] : null,
          name: stateName, 
        };
      }
      
      return this._getStateShapes;
    },
  };
  
  
  // Getters
  var getters = ['getStateShapes'];
  
  
  // Create the plugin
  jQueryPluginFactory($, 'usmap', methods, getters);




  
function getName(states) {
  var svgElements = [document.getElementsByTagName('path')];
  var stateNames = [] ;
  for ( i = 0 ; i < svgElements.length; i++) {
     $.extend(stateNames , svgElements[i].name);
  }
  
}
  

  

})(jQuery, document, window, Raphael);