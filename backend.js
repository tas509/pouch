// Create a new PouchDB instance
const db = new PouchDB('pouchDB3', {auto_compaction:true});

db.info().then(function (info) {
  console.log(info);
  var exportedDBURL = 'export-1678178762593.json'
  var url = window.location.href + exportedDBURL
  loadJsonData(db, exportedDBURL);
 
}).then(function(e){
  console.log("json default data loaded")
})


try{
  //Create indexes so we can use find. Needs pouchdb.find.js

  db.createIndex({
      index: {
          fields: ['name', "age", "weight", "height"]
      }
      }).then(function() {
     // console.log('Index created for name, age and weight fields');
      }).catch(function(err) {
      console.log('Error creating index:', err);
  });

  console.log( "Pouch DB Find plugin IS installed")
}catch(e){
  console.log("PouchDB Find plugin not installed", e)
}//*/


// Get a record by ID
async function getRecordById(id) {
  return db.get(id, {attachments: true});
}



// Function to create a new record
function createRecord(record) {
  db.put(record)
  .then(function (response) {
    $('#form-create-record').trigger("reset");
    //$('#form-create-record').hide();
    return response
  })
  .catch(function (err) {
    console.log(err);
  }).then( function(e){
    console.log("creation done")
    listAllRecords();
  }
  );
}


//UPDATE A RECORD
function updateRecord(record) {

   db.get(record._id).then(function (doc) {
    doc.name = record.name;
    doc.age = record.age;
    doc.weight = record.weight;
    doc.height = record.height;
    doc._rev = record._rev

    if (record.image) {
      doc._attachments = {
        "image": {
          content_type: record.image.type,
          data: record.image
        }
      };
    }
    console.log(doc)
    var result =   db.post(doc);
    return result

  }).then(function (response) {
    console.log("Record updated successfully", response);
    $('#update-record-form').hide();
    listAllRecords();
    return response

  }).catch(function (err) {
    console.log(err);
    return err
  });
}

// Function to delete a record
async function deleteRecord(id) {
  db.get(id).then(function (doc) {
    doc._deleted = true;
    return db.put(doc);
  });
}

// FILTER FUNCTION
// See: https://github.com/cloudant/mango#combination-operators
async function filterRecords(name, weight, height) {
  console.log("Filter: ", name, height, weight)
  //$or, and
  const query = {
    selector: {
      $or: [
        { name: { $regex: RegExp(name, 'i') } },
        //{ weight: { $eq: weight } },
        //{ height: { $eq: height } }
      ]
    },
    //sort: [{ name: 'asc' }] //get Uncaught (in promise) Error: Cannot sort on field(s) "name" when using the default index
  };
  const result = await db.find(query);
  return result.docs;
}


/////////////////// LOAD DEFAULT DATA /////////////////////////

function loadJsonData(db, jsonUrl) {
  // Fetch the JSON data from the specified URL
  fetch(jsonUrl)
    .then(response => response.json())
    .then(data => {
      // Create an array of documents to be inserted
      //console.log(data)

      const docs = data.map(record => {
        //console.log( record );
        try{
          return {
            _id: record.id.toString(),
            name: record.doc.name,
            weight: record.doc.weight,
            height: record.doc.height,
            _attachments: record.doc._attachments
          };
        }catch(e){
          console.log(e)
        }
      })

      // Insert the documents into the database using bulkDocs()
      db.bulkDocs(docs)
        .then(result => {
          console.log('JSON Data loaded successfully');
          listAllRecords()
        })
        .catch(error => {
          console.log('Error loading data:', error);
        }).then(function(e){
          console.log(e)
        });
    })
    .catch(error => {
      console.log('Error fetching data:', error);
    });

}
