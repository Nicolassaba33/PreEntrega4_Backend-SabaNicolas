const fs = require("fs");

class ProductManager {
  constructor(path) {
    this.path = path;
  }

  static id = 0;

  async getId() {
    const products = await this.getProducts();
    return products.length;
  }

  async addProduct(product) {
    if (
      !product.title ||
      !product.description ||
      !product.code ||
      !product.price ||
      !product.stock ||
      !product.thumbnail
    ) {
      return console.error("Datos incompletos");
    }
    ProductManager.id++;
    const products = await this.getProducts();
    const id = await this.getId();
    const newProduct = {
      title: product.title,
      description: product.description,
      code: product.code,
      stock: product.stock,
      thumbnail: product.thumbnail,
      price: product.price,
      id: id + 1,
    };

    products.push(newProduct);
    await fs.promises.writeFile(this.path, JSON.stringify(products), "utf-8");
  }

  async getProducts() {
    try {
      const data = await fs.promises.readFile(this.path, "utf-8");
      const products = JSON.parse(data.toString());
      return products;
    } catch (error) {
      return [];
    }
  }

  async getProductById(id) {
    const products = await this.getProducts();
    const product = products.find((p) => p.id === id);
    if (!product) {
      console.error("Producto no encontrado");
    }
    return product;
  }

  async deleteProduct(id) {
    const product = await this.getProducts();
    const productsDeleted = product.filter((product) => product.id !== id);
    await fs.promises.writeFile(
      this.path,
      JSON.stringify(productsDeleted),
      "utf-8"
    );
  }

  async updateProduct(id, productToUpdate) {
    const products = await this.getProducts();
    const updatedProducts = products.map((product) => {
      if (product.id === id) {
        return {
          ...product,
          ...productToUpdate,
          id,
        };
      }
      return product;
    });
    await fs.promises.writeFile(
      this.path,
      JSON.stringify(updatedProducts),
      "utf-8"
    );
  }
}

const test = async () => {
  const productManagerInstance = new ProductManager("./products.json");

  await productManagerInstance.addProduct({
    title: "Notebook Asus",
    description: "I3 Inside",
    code: 3200,
    stock: 3,
    thumbnail: "./asus.jpg",
    price: 1000,
  });

  await productManagerInstance.addProduct({
    title: "Notebook Dell",
    description: "I5 Inside",
    code: 3800,
    stock: 6,
    thumbnail: "./dell.jpg",
    price: 3000,
  });

  await productManagerInstance.addProduct({
    title: "Notebook Bangho",
    description: "I7 Inside",
    code: 10000,
    stock: 5,
    thumbnail: "./bangho.jpg",
    price: 2000,
  });

  const product2 = await productManagerInstance.getProductById(2);
  console.log(product2);

  /*
  await productManagerInstance.updateProduct(4, { title: "Samsung s22" }); // Se actualiza el titulo 

 
  await productManagerInstance.deleteProduct(4); // Eliminar el producto con el id:4
  */
};

test();

module.exports = ProductManager;
