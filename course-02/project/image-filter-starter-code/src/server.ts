import express, {Request, Response, NextFunction} from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles} from './util/util';
import jwt from 'jsonwebtoken';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //    the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]
  app.get( "/filteredimage", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    const { image_url } = req.query;
    if (!image_url) {
      return res.status(400).json({ message: 'Image URL is required.' });
    }

    let imagePath: string;
    try {
      imagePath = await filterImageFromURL(image_url);
    } catch (e) {
      console.error(e)
      return res.status(422).json({ message: 'Error occurred while processing the image.' })
    }

    return res.sendFile(imagePath, (err: Error) => {
      if (err) {
        next(err);
      }
      deleteLocalFiles([imagePath]);
    });
  });


  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req, res ) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();


// Authentication middleware
// Verifies the JWT token in the X-API-Key header
function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!process.env.JWT_SECRET) {
    // Assume public access if JWT_SECRET was not provided.
    return next();
  }

  if (!req.headers || !req.headers['x-api-key']) {
    return res.status(401).send({ message: 'No authorization headers.' });
  }

  const apiKey = req.headers['x-api-key'];
  const token = Array.isArray(apiKey) ? apiKey[0] : apiKey;
  return jwt.verify(token, process.env.JWT_SECRET, (err: Error, decoded: object) => {
    if (err) {
      console.error(err);
      return res.status(500).send({ message: 'Failed to authenticate.' });
    }
    return next();
  });
}

