# MongoDB Atlas Vector Search Configuration

To enable semantic search on knowledge chunks, you must manually create an Atlas Vector Search index in your MongoDB Atlas cluster.

## Index Details
- **Database:** `faqgenie` (or your configured database name)
- **Collection:** `knowledgechunks`
- **Index Name:** `knowledge_vector_index`

## Definition JSON
Paste the following definition in the Atlas Vector Search JSON editor:

```json
{
  "fields": [
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 768,
      "similarity": "cosine"
    },
    {
      "type": "filter",
      "path": "projectId"
    },
    {
      "type": "filter",
      "path": "knowledgeSourceId"
    }
  ]
}
```

## Setup Steps
1. Log in to [MongoDB Atlas](https://cloud.mongodb.com/).
2. Select your cluster and navigate to the **Atlas Search** tab.
3. Click **Create Search Index**.
4. Choose **Atlas Vector Search** (JSON Editor).
5. Select your database and the `knowledgechunks` collection.
6. Set the Index Name exactly to: `knowledge_vector_index`.
7. Paste the JSON definition above and click **Next**.
8. Click **Create Search Index** and wait for the status to become Active.
