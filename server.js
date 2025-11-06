const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const TMDB_API_KEY = process.env.TMDB_API_KEY; // Use environment variable
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.themoviedb.org/t/p/';

app.get('/share', async (req, res) => {
    // Dynamically import node-fetch to ensure it's loaded correctly in serverless environment
    const { default: fetch } = await import('node-fetch');

    const { id, type } = req.query;

    if (!id || !type) {
        return res.redirect('https://transcendent-gumption-3d5eb6.netlify.app/index.html');
    }

    try {
        const response = await fetch(`${TMDB_BASE_URL}/${type}/${id}?api_key=${TMDB_API_KEY}&language=pt-BR`);
        if (!response.ok) {
            console.error(`TMDB API error: ${response.status} ${response.statusText}`);
            return res.redirect('https://transcendent-gumption-3d5eb6.netlify.app/index.html');
        }
        const data = await response.json();

        const title = data.title || data.name || 'Suquinapp2';
        const description = data.overview || 'Descubra e explore filmes e séries.';
        const imageUrl = data.poster_path 
            ? `${TMDB_IMAGE_BASE_URL}w500${data.poster_path}`
            : 'https://transcendent-gumption-3d5eb6.netlify.app/p.png';

        const currentUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
        const redirectUrl = `https://transcendent-gumption-3d5eb6.netlify.app/index.html?type=${type}&id=${id}&from_share=true`;

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
        res.redirect('https://transcendent-gumption-3d5eb6.netlify.app/index.html');
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Access sharing links via: http://localhost:${PORT}/share?type=movie&id=123`);
});
