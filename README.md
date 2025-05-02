
# IGA Product Search API

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![API](https://img.shields.io/badge/API-REST-blue?style=for-the-badge&logo=swagger)

A simple RESTful API built with Node.js and Playwright to scrape product listings from the IGA online store. It supports query-based search, paginated results, and in-memory caching to minimize repeated scraping.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
  - [Endpoints](#endpoints)
  - [Query Parameters](#query-parameters)
  - [Response Format](#response-format)
- [Caching](#caching)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## Features

- 🔍 Search IGA products by keyword
- 📄 Paginated results
- ⚡️ In-memory caching (5 days TTL) using `node-cache`
- 🎭 Headless scraping with Playwright (Chromium)
- 🚫 Resource blocking to improve performance (images, styles, fonts)

## Prerequisites

- Node.js v14 or higher
- npm or yarn

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/vonuyvicoo/iga-scraper.git
   cd iga-scraper
   ```


2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

3. (Optional) Set environment variables in a `.env` file:

   ```env
   PORT=5002
   ```

## Usage

Start the server:

```bash
npm start
# or
node index.js
```

By default, the API listens on port `5002` or the port defined in the `PORT` environment variable.

### Endpoints

#### GET `/search`

Search for products on the IGA site.

* **URL**: `/search`
* **Method**: `GET`
* **Query Parameters**:

  * `query` *(string, required)*: Search term.
  * `page` *(integer, optional)*: Page number (default: 1).

#### Example Request

```http
GET http://localhost:5002/search?query=milk&page=2
```

#### Example Response

```json
{
  "source": "live",        
  "scrapedAt": "2025-05-02T09:15:30.123Z",
  "data": [
    {
      "product_name": "IGA Full Cream Milk (1L)",
      "current_price": "$2.50",
      "product_size": "1L",
      "product_image": "https://.../milk.jpg"
    },
    ...
  ]
}
```

### Response Format

| Field           | Type     | Description                            |
| --------------- | -------- | -------------------------------------- |
| `source`        | `string` | Indicates cache or live scraping       |
| `scrapedAt`     | `string` | ISO timestamp of when data was fetched |
| `data`          | `array`  | List of product objects                |
| `product_name`  | `string` | Name of the product                    |
| `current_price` | `string` | Display price                          |
| `product_size`  | `string` | Size parsed from name, if any          |
| `product_image` | `string` | URL of product image                   |

## Caching

This API uses an in-memory cache with a TTL of 5 days (configurable in `index.js`). Subsequent requests for the same `query:page` within the TTL will return cached results:

* **Cache Library**: `node-cache`
* **TTL**: 5 days
* **Check Period**: 10 minutes

## Project Structure

```
├── index.js          # Main server & route definitions
├── package.json      # Dependencies & scripts
├── README.md         # Project documentation
└── .env              # Environment variables (optional)
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request with your improvements.

## License

This project is licensed under the MIT License.


