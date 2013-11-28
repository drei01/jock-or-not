var dataRef = new Firebase("https://jock-or-not.firebaseio.com/voteList"),
    viewModel = {
        url:ko.observable(''),
        page : ko.observable(1),
        voteView : ko.observable(true),
        resultsView : ko.observable(false),
        toggleView : function(){
            viewModel.voteView(!viewModel.voteView());
            viewModel.resultsView(!viewModel.resultsView());
        },
        results : ko.observableArray()
    },
    apiKey="88c4981be4246987d3bb6c307b2f69ca";

window.JockOrNot = (function(){
    return{
        getFood : function (){
                    var jsonURL='http://api.flickr.com/services/rest/?method=flickr.photos.search&api_key='+apiKey+'&tags=fruit,vegetable,quiche,hummus,snack&safe_search=1&content_type=1&format=json&jsoncallback=?&per_page=1&page='+(viewModel.page() + Math.floor(Math.random() * 5) + 1);
                    $.getJSON(jsonURL,function(data){
                      //loop through the photo ids from flickr
                      $.each(data.photos.photo, function(i,photo){
                        var jsonURL="http://api.flickr.com/services/rest/?method=flickr.photos.getSizes&api_key="+apiKey+"&photo_id="+photo.id+"&format=json&jsoncallback=?"
                        //get the actual image URL from the id and append it to the document
                        $.getJSON(jsonURL,function(pdata){
                            var sizes = pdata.sizes.size;
                            viewModel.url(sizes[6].source);
                        });
                      });
                    });
                },

        addVote : function (url,male,female){
                        url = url.replace(/\./g,'~').replace(/\//g,'-');
                        var photoScoreRef = dataRef.child(url);
                        photoScoreRef.transaction(function(currentData) {
                              if (currentData === null) {
                                  return {
                                          url:url,
                                          male:male,
                                          female:female
                                          };
                              } else {
                                  return {
                                              url:url,
                                              male:currentData.male+male,
                                              female:currentData.female+female
                                          };
                              }
                        });
                        viewModel.page(viewModel.page()+1);
                        JockOrNot.getFood();
                    }
    };
})();

viewModel.resultRows = ko.computed(function() {
    var apps = this.results();
    var result = [];
    for (var i = 0; i < apps.length; i += 3) {
        var row = [];
        for (var j = 0; j < 3; ++j) {
            if (apps[i + j]) {
                row.push(apps[i + j]);
            }
        }
        result.push(row);
    }
    return result;
}, viewModel);

$(document).ready(function(){
    ko.applyBindings(viewModel);
    JockOrNot.getFood();
    dataRef.on('value', function(snapshot) {
      if(snapshot.val() === null) {
      } else {
          for(key in snapshot.val()){
             var dta = snapshot.val()[key];
             var data = {
              url:dta.url.replace(/\~/g,'.').replace(/\-/g,'/'),
              male:dta.male,
              female:dta.female
          }
          viewModel.results.push(data);
          }
      }
    });
});