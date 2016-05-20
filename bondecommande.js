    // define a namespace
    var theApp={ bdc: {} };

    theApp.bdc.Product = Backbone.Model.extend({
      defaults: {
        code: '',
        libelle: '',
        tauxtva: '',
        typevente: '',
        libcdt: '',
        qtecdt: '1',
        poidsunt: '',
        eligibletr: '',
        etat: '',
        dateapp: '',
        prixht: '',
        prixkg: '',
        prixttc: ''
      },
      toText: function () {         
          return this.trimTo(this.get("code"),6) 
                        + " " + this.trimTo(this.get("libelle"),40) 
                        + " " + this.trimTo(this.get("qtecdt"),4) 
                        + " " + this.trimTo(this.get("prixht"),10) 
                        + " " + this.trimTo(this.get("prixttc"),10);         
      },
      trimTo: function (t,l) {
         t=t.toString();
         if (typeof t.length === "undefined") {
             return Array(l).join(" ");
         }
        if (t.length>l) {
            return t.substring(0,l);
        }
        var buf=Array(l-t.length-1).join(" ");
        return   t + buf;
      }
    });

    // COLLECTION
    theApp.bdc.ProductList = Backbone.Collection.extend({
      model: theApp.bdc.Product,
      localStorage: new Store("theApp-product"),
      initialize: function (models,options) {
         window.localStorage.clear(); //always startup with a new form.        
      }
    });

    
    theApp.bdc.productList = new theApp.bdc.ProductList();   
    
    // VIEW
    theApp.bdc.ProductView = Backbone.View.extend({
      tagName: 'tr',
      template: window.JST['templates/item.html'],
      //template: _.template($('#item-template').html()),
      render: function(){
        this.$el.html(this.template(this.model.toJSON()));
        this.input = this.$('.edit');
        return this;
      },
      
      onSelectedChanged: function() {
            if (this.model.get('isSelected') === true) {
                this.$el.addClass('active');
            }
            else {
                this.$el.removeClass('active');
            }
       },
      initialize: function(){
        this.model.on('change', this.render, this);
        this.model.on('destroy', this.remove, this);
      },
      events: {
        'keypress .edit': 'updateOnEnter',
        'blur .edit': 'close',
        'click .destroy': 'destroy',
        'change .qty': 'calc',        
      },
      calc: function () {
          var v=this.$(".qty").val();
          console.log(v);
          
          if (this.model.attributes.tauxtva!="") {
              var prixttc=Math.round(this.model.attributes.prixht * v * this.model.attributes.tauxtva*100)/100; 
          } else {
              var prixttc=Math.round(this.model.attributes.prixht * v * 1.2*100)/100;              
          }
            
          this.model.save({qtecdt: v, prixttc: prixttc });
      },
      edit: function(){
        this.$el.addClass('editing');
        this.input.focus();
      },
      close: function(){
        var value = this.input.val().trim();
        if(value) {
          this.model.save({libelle: value});
        }
        this.$el.removeClass('editing');
      },
      updateOnEnter: function(e){
        if(e.which == 13){
          this.close();
        }
      },
      toggleCompleted: function(){
        this.model.toggle();
      },
      destroy: function(){
        this.model.destroy();
      }
    });
      

      
    theApp.bdc.appView = Backbone.View.extend({
      el: '#productapp',
      part_number_input: '#new-product-part_number',
      cost_input: '#new-product-cost',
      initialize: function() {        
        $('#productapp').prepend(window.JST['templates/product-input.html']());
        $('#productapp').append(window.JST['templates/product-list.html']());
        $('#product-list').append(window.JST['templates/product-list-header.html']());
        $('#productapp').append(window.JST['templates/total.html']());
          $('#total_pane').hide(); 
        this.input = this.$('#new-product');
        theApp.bdc.productList.on('add', this.addAll, this);
        theApp.bdc.productList.on('reset', this.addAll, this);
        theApp.bdc.productList.on('change', this.calc, this);
        theApp.bdc.productList.fetch();
        this.initTypeAhead();
      },
      calc: function () {
          var form_elem=$('#produits_c'); 
          console.log($('#produits_c'));
          form_elem.val("");     
          var ss_ht=0.0;
          var ss_ttc=0.0;
          for (var i=0; i< theApp.bdc.productList.length; i++) {
              theApp.bdc.productList.models[i].attributes.qtycde;
              if ( theApp.bdc.productList.models[i].attributes.tauxtva=="") {
                   theApp.bdc.productList.models[i].attributes.tauxtva=1.2;
              }
              ss_ttc+=Math.round(theApp.bdc.productList.models[i].attributes.tauxtva 
                *  theApp.bdc.productList.models[i].attributes.qtecdt
                *  theApp.bdc.productList.models[i].attributes.prixht*100)/100;
              ss_ht+=Math.round(theApp.bdc.productList.models[i].attributes.qtecdt
                *  theApp.bdc.productList.models[i].attributes.prixht*100)/100;
            
            form_elem.val(form_elem.val() + "\*" + theApp.bdc.productList.models[i].toText());                
           
            console.log("done report");                    
          }
          var total_vat=Math.round((ss_ttc - ss_ht)*100)/100;
          $('#totalht').html(Math.round(ss_ht*100)/100);  
          $('#totaltva').html(total_vat);                  
          $('#totalttc').html(ss_ttc);
          
          form_elem.val(form_elem.val() + "\*" 
            + "Total HT: " + Math.round(ss_ht*100)/100 + "\*"
            + "Total TVA: " + total_vat + "\*"            
            + "Total TTC: " + ss_ttc) + "\*";           
          $('#total_pane').show(); 
          
      },    
       initTypeAhead: function () {         
          //optimization
          var ctrl_input=this.input;
          var part_number_input=this.$("#new-product-part_number");
          var cost_input=this.$("#new-product-cost");
          var vat_code=this.$("#new-product-vat-code");
          var submit_btn=this.$("#new-product-vat-code.enter");
          var p_url=$('#productapp').attr("data-src");

          ctrl_input.typeahead({
            name: 'products',
            valueKey: 'name',
            
            remote: {
              url: p_url,
              filter: function (products) {                
                      //$('#typeahead-block').addClass('grey');  
                      return $.map(products, function (product) {                                                
                        // hack to handle htmlentities ' &apos; , etc, ...
                        //var val2=$('<p />').html(ctrl_input.val()).text();
                        //product.name=$('<p />').html(product.name).text();
                        // but product is not comming ...
                        if (product.name==ctrl_input.val()) {                               
                            //this.$('#typeahead-block').addClass('green');                         
                            part_number_input.val(product.part_number);
                            vat_code.val(product.code_tva_c);
                            cost_input.val(Math.round(product.cost * 100) / 100);
                            this.$(".enter").removeClass("btn-default").addClass("btn-primary");
                          }
                          return {
                              name: product.name
                          };
                      });
                  }
            }                       
          });        
       },
      events: {
        'keypress #new-product': 'createProductOnEnter',
        'click  #enter': 'createProductOnEnter'        
      },
      createProductOnEnter: function(e){                
        if (e.wich) {
             //on KEY_ENTER pressed
            if ( e.which !== 13 || !this.input.val().trim() ) {
              return;
            } else  {
                this.input.val('');
            }
             //on click #enter pressed
        } 
        //can select only if completed
        if (this.$('#new-product-part_number').val()==""
          || this.$('#new-product-cost').val()=="") {
          
          return;
        } 
        var self=this;

        var current_code=this.$('#new-product-part_number').val();
       
        var got_it=-1;
        $.each(theApp.bdc.productList.models, function( index, value ) {
          if (value.attributes.code.trim()==current_code.trim()) {
            got_it=index;
            return; // just break the loop
          }          
        });
        if (got_it>-1) {          
          this.input.val('');  
          this.hightlight(got_it);
          return;
        }
        theApp.bdc.productList.create(this.newAttributes());
        this.$('#new-product-part_number').val("");
        this.$('#new-product-cost').val("");        
        this.input.val('');
        this.$(".enter").removeClass("btn-primary").addClass("btn-default");
      },
      hightlight: function (idx) {
        console.log(theApp.bdc.productList.models[idx]);        
        theApp.bdc.productList.models[idx].set({isSelected: true});
      },
      addOne: function(product){
        var view = new theApp.bdc.ProductView({model: product});
        $('#product-list').append(view.render().el);

      },
      addAll: function(){
        this.$('#product-list').html('');
        $('#product-list').append(window.JST['templates/product-list-header.html']());
  
        switch(window.filter){
          default:
            theApp.bdc.productList.each(this.addOne, this);
            break;
        }
      },      
      newAttributes: function(){
        var prixttc=Math.round($(this.cost_input).val() *1.2*100)/100;
        return {
          code: $(this.part_number_input).val(),
          prixht: $(this.cost_input).val(),
          libelle: this.input.val().trim(),
          prixttc: prixttc
        }
      }
    });
     
    theApp.bdc.Router = Backbone.Router.extend({
      routes: { '' : '' }
    });
    
    theApp.bdc.router = new theApp.bdc.Router();
    Backbone.history.start();
    theApp.bdc.appView = new theApp.bdc.appView();
    
                                                                                                  