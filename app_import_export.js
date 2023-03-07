function exportJSON (done) {
  db.allDocs({include_docs: true, descending: true}, function (err, doc) {
    const jsonLink = document.createElement('a')
    jsonLink.download = `button-data-${Date.now()}.json`
    jsonLink.href = `data:application/json;charset=utf-8, ${JSON.stringify(doc.rows)}`
    jsonLink.click()
  })
}

function importJSON (done) {
  if (!done) done = () => {}
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

function deleteData (done) {
  if (!done) done = () => {}

  let count = 0
  db.allDocs({include_docs: true, descending: true}, function (err, docs) {
    for (let i = 0; i < docs.rows.length; i++) {
      db.remove(docs.rows[i].doc, (err) => {
        if (err) return done(err)
        count++
        if (count === docs.rows.length) return done(null)
      })
    }
  })
}