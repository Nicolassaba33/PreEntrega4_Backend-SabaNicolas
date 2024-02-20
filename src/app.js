const express = require("express");
const fs = require("fs").promises;
const { v4: uuidv4 } = require("uuid");
const ProductManager = require("./ProductManager");
const app = express();
const port = 8080;

const productManager = new ProductManager("./products.json");
let carts = [];

const productsFilePath = "./productos.json";
const cartsFilePath = "./carrito.json";

const productsRouter = express.Router();
const cartsRouter = express.Router();

app.use(express.json());

app.get("/api/carts/:cid", async (req, res) => {
  try {
    const cartId = req.params.cid;
    const cartsData = await fs.readFile(cartsFilePath, "utf8");
    const carts = JSON.parse(cartsData);

    const cart = carts.find((cart) => cart.id === cartId);

    if (!cart) {
      res.status(404).json({ error: "Carrito no encontrado" });
    } else {
      res.json({ products: cart.products });
    }
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al obtener los productos del carrito" });
  }
});

app.post("/api/carts/:cid/product/:pid", async (req, res) => {
  try {
    const cartId = req.params.cid;
    const productId = req.params.pid;

    // Leer los datos de los carritos
    const cartsData = await fs.readFile(cartsFilePath, "utf8");
    let carts = JSON.parse(cartsData);

    // Buscar el carrito
    const cart = carts.find((cart) => cart.id === cartId);
    if (!cart) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

    // Verificar si el producto ya está en el carrito
    const existingProduct = cart.products.find(
      (item) => item.product === productId
    );
    if (existingProduct) {
      // Si el producto ya existe, incrementar la cantidad
      existingProduct.quantity++;
    } else {
      // Si el producto no existe, agregarlo al carrito con cantidad 1
      cart.products.push({ product: productId, quantity: 1 });
    }

    // Escribir los datos actualizados de los carritos en el archivo
    await fs.writeFile(cartsFilePath, JSON.stringify(carts, null, 2));

    res
      .status(201)
      .json({ message: "Producto agregado al carrito correctamente", cart });
  } catch (error) {
    res.status(500).json({ error: "Error al agregar el producto al carrito" });
  }
});

app.listen(port, () => {
  console.log(`Servidor Express iniciado en http://localhost:${port}`);
});
productsRouter.get("/", async (req, res) => {
  try {
    const limit = req.query.limit;
    const products = limit
      ? (await productManager.getProducts()).slice(0, limit)
      : await productManager.getProducts();
    res.json({ products });
  } catch (err) {
    res.status(500).json({ err: "Error al obtener productos" });
  }
});

productsRouter.get("/:pid", async (req, res) => {
  try {
    const productId = parseInt(req.params.pid);
    const product = await productManager.getProductById(productId);

    if (!product) {
      res.status(404).json({ err: "Productos no encontrado" });
    } else {
      res.json({ product });
    }
  } catch (err) {
    res.status(500).json({ err: "Error al obtener el producto" });
  }
});

productsRouter.post("/", async (req, res) => {
  try {
    const { title, description, code, price, stock, category, thumbnails } =
      req.body;
    if (!title || !description || !code || !price || !stock || !category) {
      return res
        .status(400)
        .json({ error: "Todos los campos son obligatorios" });
    }

    const newProduct = {
      id: productManager.getNextProductId(),
      title,
      description,
      code,
      price,
      status: true,
      stock,
      category,
      thumbnails: thumbnails || [],
    };

    await productManager.addProduct(newProduct);
    res.status(201).json({
      message: "Producto agregado correctamente",
      product: newProduct,
    });
  } catch (error) {
    res.status(500).json({ error: "Error al agregar el producto" });
  }
});

productsRouter.delete("/:pid", async (req, res) => {
  try {
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar el producto" });
  }
});

cartsRouter.get("/:cid", (req, res) => {
  try {
    const cartId = req.params.cid;
    const cart = carts.find((cart) => cart.id === cartId);

    if (!cart) {
      res.status(404).json({ error: "Carrito no encontrado" });
    } else {
      res.json({ products: cart.products });
    }
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al obtener los productos del carrito" });
  }
});

cartsRouter.post("/:cid/product/:pid", (req, res) => {
  try {
    const cartId = req.params.cid;
    const productId = req.params.pid;

    const cart = carts.find((cart) => cart.id === cartId);
    if (!cart) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

    const existingProduct = cart.products.find(
      (item) => item.product === productId
    );
    if (existingProduct) {
      existingProduct.quantity++;
    } else {
      cart.products.push({ product: productId, quantity: 1 });
    }

    res
      .status(201)
      .json({ message: "Producto agregado al carrito correctamente", cart });
  } catch (error) {
    res.status(500).json({ error: "Error al agregar el producto al carrito" });
  }
});

cartsRouter.post("/", (req, res) => {
  try {
  } catch (error) {
    res.status(500).json({ error: "Error al crear el carrito" });
  }
});

app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);

app.listen(port, () => {
  console.log(`Servidor Express iniciado en http://localhost:${port}`);
});
