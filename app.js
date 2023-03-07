//LIST ALL RECORDS
function listAllRecords() {
    console.log("listAllRecords")
  
    $('#create-record-form').show()
    $('#update-record-form').hide()
    //Are these options correct? https://pouchdb.com/api.html#batch_fetch
    var options = {
      include_docs: true,
      attachments: true,
      //style: 'main_only',
      descending: true,
    }
  
    const result =   db.allDocs(options).then(function(docs){     
      //console.log("docs",docs.rows)
      displayRecords(docs.rows)
    })
     
  }

//DISPLAY GIVEN RECORDS
function displayRecords(records) {
  var recordList = $('#record-list');

  recordList.empty();

  records.forEach(function (record) {
    //console.log("record:", record)
    var doc = record.doc
    
    if (doc.name) { //horrid row HACK to exclude odd records that were appearing, not sure what they were (revision objects perhaps?)... 

      var listItem = $('<li class="record-item"></li>');

      var name = $('<h2 class="record-name"></h2>').text(doc.name);
      listItem.append(name);

      // display image
      if (doc._attachments) {
        db.getAttachment(doc._id, 'image').then(function (blob) {
          var img = $('<img class="record-image" width="74" style="float:left">');
          img.attr('src', URL.createObjectURL(blob));
          listItem.append(img);
        });
      }//end image

      var weight = $('<p class="record-weight"></p>').text('Weight: ' + doc.weight + ' kg');
      listItem.append(weight);
      var height = $('<p class="record-height"></p>').text('Height: ' + doc.height + ' cm');
      listItem.append(height);

      // buttons
      listItem.append($('<button class="update-record-button" data-id="' + doc._id + '">Edit</button>'));

      listItem.append($('<button class="delete-record-button" data-id="' + doc._id + '">Delete</button>'));


      recordList.append(listItem);
    }//end horrid hack

  });//end forEach
  recordList.show()

}

//DISPLAY GIVEN DOCS
function displayDocs(docs) {
  var recordList = $('#record-list');

  recordList.empty();

  docs.forEach(function (doc) {
    //console.log("record:", record)
  
    
    if (doc.name) { //horrid row HACK to exclude odd records that were appearing, not sure what they were (revisions?)... 

      var listItem = $('<li class="record-item"></li>');

      var name = $('<h2 class="record-name"></h2>').text(doc.name);
      listItem.append(name);

      // display image
      if (doc._attachments) {
        db.getAttachment(doc._id, 'image').then(function (blob) {
          var img = $('<img class="record-image" width="74" style="float:left">');
          img.attr('src', URL.createObjectURL(blob));
          listItem.append(img);
        });
      }//end image

      var weight = $('<p class="record-weight"></p>').text('Weight: ' + doc.weight + ' kg');
      listItem.append(weight);
      var height = $('<p class="record-height"></p>').text('Height: ' + doc.height + ' cm');
      listItem.append(height);

      // buttons
      listItem.append($('<button class="update-record-button" data-id="' + doc._id + '">Edit</button>'));

      listItem.append($('<button class="delete-record-button" data-id="' + doc._id + '">Delete</button>'));


      recordList.append(listItem);
    }//end horrid hack

  });//end forEach
  recordList.show()

}//end displayDocs

jQuery(document).ready(function($){
  // Initialized PouchDB in app.js

  ///////////////////// ATTACHING EVENT HANDLERS/LISTENERS etc ///////////


  // CREATE A RECORD
  $('#form-create-record').submit(function (event) {
    event.preventDefault();
    console.log('creating a record')
    var formData = new FormData($(this)[0]);

    // get the file input element and check if it's empty
    var fileInput = document.getElementById('image');
    const file = fileInput.files[0];
    // read the file content and add it to the form data
    var reader = new FileReader();
    reader.onload = function () {
      var fileContent = reader.result;
      var file = new Blob([fileContent], { type: fileInput.files[0].type });
      formData.set('image-file', file, fileInput.files[0].name);
      $('#create-record-form').trigger("reset");
      $('#create-record-form').show();
    };
    reader.readAsArrayBuffer(fileInput.files[0]);

    const name = $('#name').val();
    const weight = parseInt($('#weight').val());
    const height = parseInt($('#height').val());

    const record = {
      _id: new Date().toISOString(),
      name: name,
      weight: weight,
      height: height,
      _attachments: {
        image: {
          content_type: file.type,
          data: file,
        },
      },
    };

    createRecord(record)
    
    // List all records on page load
    $('div#update-record-form').hide()
   
  });

  // DO THE ACTUAL UPDATE OF A RECORD
  $('#update-record-form').submit(async function (event) {
    event.preventDefault();

    //Get values from form
    var id = $('#form-update-record input[name="_id-update"]').val()
    var rev = $('#form-update-record input[name="_rev-update"]').val();
    var name = $("#form-update-record input[name='name-update']").val();
    var age = $("#form-update-record input[name='age-update']").val();
    var weight = $("#form-update-record input[name='weight-update']").val();
    var height = $("#form-update-record input[name='height-update']").val();

    var record = {
      _id: id,
      _rev: rev,
      name: name,
      age: parseInt(age),
      weight: parseFloat(weight),
      height: parseFloat(height),

    };
    console.log("record:", record)

    // get the file input element and check if it's empty
    var fileInput = document.getElementById('update-image');
    console.log("fileInput", fileInput)
    if (fileInput) {
      if (fileInput.files[0]) {
        var imageName = fileInput.dataset.imageName;
        var imageType = fileInput.dataset.imageType;

        // read the file content and add it to the form data
        var reader = new FileReader();
        var file
        reader.onload = function () {
          var fileContent = reader.result;
          file = new Blob([fileContent], { type: fileInput.files[0].type });
          //formData.set('image-file', file, fileInput.files[0].name);

        };
        reader.readAsArrayBuffer(fileInput.files[0]);
      }
      record['image'] = file
    }

    //Call update record in the backend
    updateRecord(record).then(function (response) {
      //DO THE UPDATE
      console.log("response:", response)
    }); 

    
  });//END UPDATE A RECORD


 //UTILITY TO FILL OUT THE FORM WITH THE RECORD'S DATA
  function populateUpdateForm(id) {
    getRecordById(id).then(function (record) {
      console.log(id, record)
      $("#form-update-record [name=_id-update]").val(record._id);
      $("#update-record-form [name=_rev-update]").val(record._rev);
      $("#update-record-form [name=name-update]").val(record.name);
      $("#update-record-form [name=weight-update]").val(record.weight);
      $("#update-record-form [name=height-update]").val(record.height);

      console.log("attachments:", record._attachments)
      if (record._attachments && record._attachments["image"]) {
        //does it have an attachment?


        //Make a separate trip fto get the image
        db.getAttachment(record._id, 'image').then(function (blob) {
          var url = URL.createObjectURL(blob);
          $('#update-record-form #image-update').attr('src', url);
          //show the preview
          $("#update-record-form .current-image").attr("src", url);
          $("#update-record-form .current-image").attr("width", 100);
          $("#update-record-form .current-image").show();
          //end show preview
        }).catch(function (err) {
          console.log(err);
        });

      } else {
        // If the record does not have an image attachment, hide the current image element
        $('#update-record-form .current-image').hide();
      }

      $("#update-record-form .current-image").show();
    });
  }


  // USER CLICKS THE EDIT BUTTON
  $(document).on('click', '.update-record-button', function (event) {
    console.log('Clicked the update button')
    event.preventDefault();
    var recordId = $(this).attr('data-id');
    console.log("recordId:", recordId)
    populateUpdateForm(recordId);
    $('#create-record-form').hide();
    $('#update-record-form').show();

    //Scroll to the right place hack
    $([document.documentElement, document.body]).animate({
          scrollTop: $("#create-record-form").offset().top 
      });


  });

  // SEARCH and FILTER TOOLS -- USER CLICKS SEARCH BUTTON
  $('#filter-records-form').submit(function (event) {
    event.preventDefault();
    var name = $(' #name-filter').val();
    var weight = $(' #weight-filter').val();
    var height = $('#height-filter').val();
    filterRecords(name, weight, height).then(function(docs){
      console.log("docs", docs)
      displayDocs(docs)
    })
    

    
  });

  // Clear filters
  $('#clear-filter-button').click(function (event) {
    event.preventDefault();
    $('#form-filter-records #name-filter').val('');
    $('#form-filter-records #weight-filter').val('');
    $('#form-filter-records #height-filter').val('');
    listAllRecords();
  });

  // DELETE A RECORD
  $(document).on('click', '.delete-record-button', function (event) {
    event.preventDefault();
    var recordId = $(this).attr('data-id');
    console.log("deleting:", recordId)
    deleteRecord(recordId);
    listAllRecords()
  });





  //EXPORT DATABASE
  $(document).on('click', '#export-data-btn', function (event) {
    console.log("exporting…")
    db.allDocs({ include_docs: true, descending: true, attachments: true }, function (err, doc) {
      const jsonLink = document.createElement('a')
      jsonLink.download = `export-${Date.now()}.json`
      jsonLink.href = `data:application/json;charset=utf-8, ${JSON.stringify(doc.rows)}`
      jsonLink.click()
    })
  });



  console.log("ready…")
  listAllRecords()
});//end document ready

function deleteData(done) {
  if (!done) done = () => { }

  let count = 0
  db.allDocs({ include_docs: true, descending: true }, function (err, docs) {
    for (let i = 0; i < docs.rows.length; i++) {
      db.remove(docs.rows[i].doc, (err) => {
        if (err) return done(err)
        count++
        if (count === docs.rows.length) return done(null)
      })
    }
  })
}

//IMPORT DATABASE
function importJSON() {
  console.log("importing")

  const importFiles = Array.from(document.getElementById('import-file').files)
  const jsonFiles = importFiles.filter((file) => file.type === 'application/json')

  importFiles.forEach((file) => {
    console.log(file.name, file.type)
  })

  const reader = new FileReader()

  reader.onerror = (e) => {
    return cb(e)
  }

  reader.onload = (e) => {
    let jsonData
    try {
      jsonData = JSON.parse(e.target.result)
    } catch (e) {
      return cb(e)
    }

    document.getElementById('import-file').value = null

    return db.bulkDocs(jsonData.map((item) => {
      delete item.doc._rev
      return item.doc
    }))
  }

  reader.readAsText(jsonFiles[0], 'UTF-8')

}