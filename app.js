// app.js
const fetch = require('node-fetch');

const domain = 'https://anatta-test-store.myshopify.com';
const storefrontAccessToken = '6d6dda47f54e5a5ff4e04d4822b4de91';

const productName = process.argv[3]; // Get product name from command line argument
if (!productName) {
  console.error('Please provide a product name');
  process.exit(1);
}

const query = `
{
  products(first: 5) {
    edges {
      node {
        title
        variants(first: 5) {
          edges {
            node {
              id
              title
              priceV2 {
                amount
                currencyCode
              }
            }
          }
        }
      }
    }
  }
}
`;

async function fetchProducts() {
  const url = `${domain}/api/2021-07/graphql.json`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'X-Shopify-Storefront-Access-Token': storefrontAccessToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query })
  });

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  return response.json();
}

fetchProducts().then(data => {
  const products = data.data.products.edges;
  if (products.length === 0) {
    console.log('No products found');
    return;
  }

  console.log('Products and Variants sorted by Price:');
  products.forEach(product => {
    console.log(`Product: ${product.node.title}`);
    const variants = product.node.variants.edges.map(edge => edge.node).sort((a, b) => a.priceV2.amount - b.priceV2.amount);
    variants.forEach(variant => {
      console.log(` - Variant: ${variant.title}, Price: ${variant.priceV2.amount} ${variant.priceV2.currencyCode}`);
    });
  });
}).catch(error => {
  console.error('Failed to fetch products:', error);
});
