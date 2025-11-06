const express = require('express');
const fetch = require('node-fetch'); // For fetching TMDB data
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const TMDB_API_KEY = '5e5da432e96174227b25086fe8637985'; // Replace with your actual TMDB API Key
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.themoviedb.org/t/p/';

// Serve static files from the 'public' directory (if you have one)
// app.use(express.static(path.join(__dirname, 'public')));

app.get('/share', async (req, res) => {
    const { id, type } = req.query;

    if (!id || !type) {
        // If no ID or type, redirect to the main app or show an error
        return res.redirect('/index.html'); // Adjust this path as needed for your main app
    }

    try {
        const response = await fetch(`${TMDB_BASE_URL}/${type}/${id}?api_key=${TMDB_API_KEY}&language=pt-BR`);
        if (!response.ok) {
            console.error(`TMDB API error: ${response.status} ${response.statusText}`);
            // Redirect to main app if TMDB data fetch fails
            return res.redirect('/index.html'); // Adjust this path
        }
        const data = await response.json();

        const title = data.title || data.name || 'Suquinapp2';
        const description = data.overview || 'Descubra e explore filmes e séries.';
        const imageUrl = data.poster_path 
            ? `${TMDB_IMAGE_BASE_URL}w500${data.poster_path}`
            : 'p.png'; // Default image if no poster

        // Construct the full URL for the current page for og:url
        const currentUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;

        // Construct the redirect URL to your main client-side app
        const redirectUrl = `/index.html?type=${type}&id=${id}&from_share=true`; // Adjust this path

        // Send an HTML response with meta tags and a JavaScript redirect
        res.send(`
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${title}</title>
                
                <!-- Open Graph Meta Tags -->
                <meta property="og:title" content="${title}">
                <meta property="og:description" content="${description}">
                <meta property="og:image" content="${imageUrl}">
                <meta property="og:type" content="website">
                <meta property="og:url" content="${currentUrl}">

                <!-- Twitter Card Meta Tags -->
                <meta name="twitter:card" content="summary_large_image">
                <meta name="twitter:title" content="${title}">
                <meta name="twitter:description" content="${description}">
                <meta name="twitter:image" content="${imageUrl}">

                <!-- Redirect to your client-side application -->
                <script>
                    window.location.replace("${redirectUrl}");
                </script>
            </head>
            <body>
                Carregando conteúdo...
            </body>
            </html>
        `);

    } catch (error) {
        console.error("Error generating meta tags or fetching TMDB data:", error);
        // Redirect to main app if an error occurs
        res.redirect('/index.html'); // Adjust this path
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Access sharing links via: http://localhost:${PORT}/share?type=movie&id=123`);
});
