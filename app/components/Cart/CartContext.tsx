import React, { useState, createContext, ReactNode, useContext } from "react";

// Definição do tipo para os itens do carrinho
interface CartItem {
  id: number;       // ID do produto
  price: number;    // Preço do produto
  quantity: number; // Quantidade do produto no carrinho
  total: number;    // Preço total do item (quantity * price)
}

// Definição do tipo do contexto
interface CartContextType {
  cartList: Array<{ id: number; price: number; quantity: number; total: number; name: string }>;
  addCart: (cartObj: { id: number; price: number; name: string }) => void;
  subCart: (cartObj: { id: number }) => void;
  totalCarrinho: number;
}

// Criação do contexto com tipo inicial
export const CartContent = createContext<CartContextType | undefined>(undefined);

// Provedor do contexto
export default function CartProvider({ children }: { children: ReactNode }) {
  const [cartList, setCartList] = useState<CartContextType["cartList"]>([]);
  const [totalCarrinho, setTotalCarrinho] = useState(0);

  function addCart(cartObj: { id: number; price: number; name: string }) {
    const indexCart = cartList.findIndex((item) => item.id === cartObj.id);

    if (indexCart !== -1) {
      const list = [...cartList];
      list[indexCart].quantity += 1;
      list[indexCart].total = list[indexCart].quantity * list[indexCart].price;
      setCartList(list);
      totalResultCart(list);
      return;
    }

    const data = {
      ...cartObj,
      quantity: 1,
      total: cartObj.price,
    };

    setCartList((items) => [...items, data]);
    totalResultCart([...cartList, data]);
  }

  function subCart(cartObj: { id: number }) {
    const indexCart = cartList.findIndex((item) => item.id === cartObj.id);

    if (indexCart !== -1) {
      if (cartList[indexCart].quantity > 1) {
        const list = [...cartList];
        list[indexCart].quantity -= 1;
        list[indexCart].total = list[indexCart].quantity * list[indexCart].price;
        setCartList(list);
        totalResultCart(list);
        return;
      }

      const newList = cartList.filter((item) => item.id !== cartObj.id);
      setCartList(newList);
      totalResultCart(newList);
    }
  }

  function totalResultCart(items: CartContextType["cartList"]) {
    const result = items.reduce((acc, obj) => acc + obj.total, 0);
    setTotalCarrinho(result);
  }

  return (
    <CartContent.Provider value={{ cartList, addCart, subCart, totalCarrinho }}>
      {children}
    </CartContent.Provider>
  );
}

// Hook personalizado para consumir o contexto
export const useCart = (): CartContextType => {
  const context = useContext(CartContent);
  if (!context) {
    throw new Error("useCart deve ser usado dentro de um CartProvider");
  }
  return context;
};
