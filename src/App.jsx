import { useState, useEffect } from "react";
import "./App.css";

function App() {

  // ============================================================
  // 1. STATE
  // ============================================================

  // useState stores DATA THAT CAN CHANGE.
  //
  // When state changes:
  //
  //     setState()
  //        ↓
  //     React re-renders
  //        ↓
  //     UI reflects the new state
  //
  // Ask yourself:
  // "Does this value change AND does the UI need to react to it?"
  // If yes → it may need state.

  const [products, setProducts] = useState([]);
  // products = the actual product data
  // setProducts = changes the products state
  // [] = initial value because we don't have products yet

  const [loading, setLoading] = useState(true);
  // Starts true because the API request hasn't finished yet.
  // When the request finishes → setLoading(false)

  const [error, setError] = useState(null);
  // null = no error
  // If something fails → store the Error object here.

  const [cart, setCart] = useState([]);
  // The cart is state because adding/removing/changing
  // products must cause the UI to update.

  const [searchTitle, setSearchTitle] = useState("");
  // Stores exactly what the user types into the search box.
  //
  // This makes the input a CONTROLLED INPUT:
  //
  //     user types
  //        ↓
  //     onChange
  //        ↓
  //     setSearchTitle()
  //        ↓
  //     searchTitle changes
  //        ↓
  //     input displays new value


  // ============================================================
  // 2. DERIVED VALUES
  // ============================================================

  // DERIVED VALUE:
  // A value that can be calculated from existing state.
  //
  // Don't create another useState for this.
  //
  // cart → calculation → total
  //
  // If cart changes, total automatically gets recalculated
  // during the next render.

  const total = cart.reduce((accumulator, item) => {
    return accumulator + item.price * item.quantity;
  }, 0);

  // reduce() = turn an ARRAY into ONE VALUE.
  //
  // Example:
  //
  //     Laptop:  $100 × 2 = $200
  //     Mouse:   $50  × 1 = $50
  //
  //     reduce()
  //          ↓
  //        $250
  //
  // accumulator = running total
  // item         = current cart item
  // 0            = starting accumulator value


  // Another derived value.
  //
  // We DON'T change products itself.
  //
  // Instead:
  //
  //     products
  //        ↓
  //      filter()
  //        ↓
  // filteredProducts
  //
  // The original API data remains untouched.

  const filteredProducts = products.filter((product) => {
    return product.title
      .toLowerCase()
      .includes(searchTitle.toLowerCase());
  });

  // filter() asks every product:
  //
  //     "Should this item remain?"
  //
  // true  → keep it
  // false → remove it from the new array
  //
  // toLowerCase() makes the search case-insensitive.
  //
  // includes() checks whether the title contains the search text.
  //
  // Example:
  //
  // searchTitle = "lap"
  //
  // "Laptop".toLowerCase()
  //       ↓
  // "laptop"
  //
  // "laptop".includes("lap")
  //       ↓
  // true
  //
  // Therefore Laptop remains in filteredProducts.


  // ============================================================
  // 3. ADD TO CART
  // ============================================================

  function addCart(product) {

    // find() searches for ONE matching item.
    //
    // We need to know:
    // "Is this product already in the cart?"
    //
    // If found → returns the product object.
    // If not found → returns undefined.

    const existingProduct = cart.find(
      (item) => item.id === product.id
    );


    // ----------------------------------------------------------
    // PRODUCT ALREADY EXISTS
    // ----------------------------------------------------------

    if (existingProduct) {

      // We cannot simply modify the existing cart.
      //
      // Instead:
      //
      //     old cart
      //        ↓
      //       map()
      //        ↓
      //     new cart
      //
      // This follows React's IMMUTABILITY pattern:
      // create new arrays/objects instead of directly modifying
      // existing state.

      const updatedCart = cart.map((item) => {

        // Only modify the product that was clicked.

        if (item.id === product.id) {

          return {
            ...item,
            // Spread copies the existing properties.
            //
            // Without ...item, we'd lose:
            // id, title, price, image, etc.

            quantity: item.quantity + 1,
            // Override only the quantity.
          };
        }

        // Every other product remains unchanged.
        return item;
      });

      // Tell React to replace the old cart with the new cart.
      setCart(updatedCart);


    // ----------------------------------------------------------
    // PRODUCT DOES NOT EXIST
    // ----------------------------------------------------------

    } else {

      setCart([
        ...cart,
        // Copy all existing cart items first.

        {
          ...product,
          // Copy the product's API data.

          quantity: 1,
          // quantity is information we add ourselves.
        },
      ]);
    }
  }


  // ============================================================
  // 4. INCREASE QUANTITY
  // ============================================================

  function increaseQuantity(item) {

    // map() is appropriate because:
    //
    // We want to keep the whole cart,
    // but MODIFY ONE item inside it.

    const updatedCart = cart.map((cartItem) => {

      // Identify the item that the user clicked.
      //
      // item     = clicked cart item
      // cartItem = item currently being examined by map()

      if (cartItem.id === item.id) {

        return {
          ...cartItem,

          // Change only the quantity.
          quantity: cartItem.quantity + 1,
        };
      }

      // Don't modify other cart items.
      return cartItem;
    });

    setCart(updatedCart);
  }


  // ============================================================
  // 5. DECREASE QUANTITY
  // ============================================================

  function decreaseQuantity(item) {

    // We need two possible behaviors:
    //
    // quantity > 1
    //     ↓
    // decrease quantity
    //
    // quantity === 1
    //     ↓
    // remove product completely

    let updatedCart;


    // ----------------------------------------------------------
    // REMOVE ITEM
    // ----------------------------------------------------------

    if (item.quantity === 1) {

      // filter() is used because we want to REMOVE an item.
      //
      // Keep every item whose ID does NOT match the clicked item.
      //
      // Example:
      //
      // clicked item ID = 2
      //
      // ID 1 → 1 !== 2 → true  → KEEP
      // ID 2 → 2 !== 2 → false → REMOVE
      // ID 3 → 3 !== 2 → true  → KEEP

      updatedCart = cart.filter((cartItem) => {
        return cartItem.id !== item.id;
      });


    // ----------------------------------------------------------
    // DECREASE QUANTITY
    // ----------------------------------------------------------

    } else {

      // If quantity is greater than 1,
      // we keep the product but decrease its quantity.

      updatedCart = cart.map((cartItem) => {

        if (cartItem.id === item.id) {

          return {
            ...cartItem,
            quantity: cartItem.quantity - 1,
          };
        }

        return cartItem;
      });
    }

    // Both branches eventually produce a new cart.
    setCart(updatedCart);
  }


  // ============================================================
  // 6. API REQUEST — useEffect
  // ============================================================

  // useEffect is used for SIDE EFFECTS.
  //
  // A side effect is something React isn't simply calculating
  // for rendering.
  //
  // Examples:
  // - API requests
  // - timers
  // - subscriptions
  // - browser APIs
  //
  // Here:
  //
  //     Component renders
  //           ↓
  //     useEffect runs
  //           ↓
  //     API request
  //           ↓
  //     setProducts()
  //           ↓
  //     React renders products

  useEffect(() => {

    // We define an async function INSIDE the effect.
    //
    // The useEffect callback itself should not be made async.
    // Instead, create an async function and call it.

    async function fetchProducts() {

      try {

        // fetch() sends the HTTP request.
        const response = await fetch(
          "https://fakestoreapi.com/products"
        );


        // IMPORTANT:
        // fetch() does NOT automatically throw when the server
        // responds with HTTP errors like 404 or 500.
        //
        // Therefore we manually check response.ok.

        if (!response.ok) {
          throw new Error("Network response failed");
        }


        // Convert the response body from JSON → JavaScript data.

        const data = await response.json();


        // Store the API data in React state.

        setProducts(data);

      } catch (error) {

        // If the request or JSON parsing fails,
        // store the error in state.

        setError(error);

      } finally {

        // Runs whether the request succeeded OR failed.
        //
        // Therefore loading always ends.

        setLoading(false);
      }
    }


    // Actually execute the async function.

    fetchProducts();


  }, []);

  // [] = empty dependency array.
  //
  // This tells React:
  //
  // "Run this effect after the component's initial render."
  //
  // It prevents the API request from running on every render.


  // ============================================================
  // 7. CONDITIONAL RENDERING
  // ============================================================

  // Early return:
  //
  // If we're still waiting for the API,
  // don't render the normal application yet.

  if (loading) {
    return <h1>Loading...</h1>;
  }


  // If the request failed,
  // show the error instead of the normal application.

  if (error) {
    return <h1>{error.message}</h1>;
  }


  // ============================================================
  // 8. RENDER UI
  // ============================================================

  return (
    <div>

      <h1>PRODUCT LIST</h1>


      {/* ========================================================
          CART
      ========================================================= */}

      {cart.length > 0 ? (

        // TERNARY:
        //
        // condition ? TRUE : FALSE
        //
        // cart.length > 0
        //     ↓
        //     YES → show cart
        //     NO  → show empty message

        <div>

          <h2>Cart:</h2>


          {/* map() renders one UI block for every cart item */}

          {cart.map((item) => (

            <div key={item.id}>

              <h3>{item.title}</h3>

              <p>Quantity: {item.quantity}</p>


              {/* The arrow function allows us to pass
                  the specific item to our handler. */}

              <button
                onClick={() => increaseQuantity(item)}
              >
                +
              </button>


              <button
                onClick={() => decreaseQuantity(item)}
              >
                -
              </button>

            </div>
          ))}


          {/* total is recalculated whenever cart changes */}

          <h2>
            Total: ₱{total.toFixed(2)}
          </h2>

        </div>

      ) : (

        // FALSE branch of the ternary

        <h2>Your cart is empty.</h2>
      )}


      <hr />


      {/* ========================================================
          SEARCH
      ========================================================= */}

      <label>
        Search:{" "}

        <input
          type="text"

          // CONTROLLED INPUT:
          // React state controls the input's value.

          value={searchTitle}

          // Every time the user types:
          //
          // event.target.value
          //        ↓
          // setSearchTitle()
          //        ↓
          // searchTitle changes

          onChange={(event) => {
            setSearchTitle(event.target.value);
          }}
        />

      </label>


      {/* ========================================================
          PRODUCTS
      ========================================================= */}

      {filteredProducts.length > 0 ? (

        // Only matching products are rendered.

        filteredProducts.map((product) => (

          // key gives React a stable identity for each item.
          <div key={product.id}>

            <h2>{product.title}</h2>

            <p>Price: ₱{product.price}</p>


            <img
              src={product.image}
              alt={product.title}
            />


            <br />


            <button
              onClick={() => addCart(product)}
            >
              Add to Cart
            </button>

          </div>
        ))

      ) : (

        // No products matched the search.

        <p>No products found.</p>
      )}

    </div>
  );
}

export default App;