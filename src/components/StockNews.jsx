import React, { useState, useEffect } from 'react';
import { POLYGON_API_KEY } from './apikey';

function StockNews({ symbol }) { 
  const [newsArticles, setNewsArticles] = useState([]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch(
          `https://api.polygon.io/v2/reference/news?ticker=meta&limit=10&apiKey=EDVLkHBKW4Id40n52bDjeVP1RBJ2Ppob`
        );
        if (response.ok) {
          const data = await response.json();
          setNewsArticles(data.results || []);
        } else {
          throw new Error(`Error fetching news for ${symbol}: ${response.status} ${response.statusText}`);
        }
      } catch (error) {
        console.error(`Error fetching news for ${symbol}:`, error);
      }
    };

    if (symbol) {
      fetchNews();
    }
  }, [symbol]);

  return (
    <div className="stock-news">
      <h3>News for {symbol}</h3>
      <ul>
        {newsArticles.map((article, index) => (
          <li key={index}>
            <h4>{article.title}</h4>
            <p>{article.description}</p>
            <a href={article.article_url} target="_blank" rel="noopener noreferrer">
              Read more
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default StockNews;