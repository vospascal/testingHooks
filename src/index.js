import React, { useState } from "react";
import ReactDOM from "react-dom";
import FinalFormConverterHook from "./FinalFormConverterHook";

function App() {
  const test = {
    product1: {
      test: "123",
      color: "red",
      accountd: {
        accountNumber: ""
      }
    },
    product2: {
      test: "123",
      color: "green",
      account: {
        accountNumber: ""
      }
    }
  };
  const [mainObj, setMainObj] = useState(test);

  const FinalFormConverterSchema = [
    {
      key: "accountNumber",
      references: [
        "product1.accountd.accountNumber",
        "product2.account.accountNumber",
        "product3.account.accountNumber"
      ],
      mode: "rw-"
    },
    {
      key: "test",
      references: ["product1.test"],
      mode: "rw-"
    }
  ];

  const [converted, convertedCallback] = FinalFormConverterHook({
    stateOriginal: mainObj,
    context: mainObj,
    callback: ({ formObject }) => {
      console.log("submitHandler pressed", formObject);
      setMainObj(formObject);
    },
    type: "aanvraag",
    schema: FinalFormConverterSchema
  });

  return (
    <div className="App">
      <pre>{JSON.stringify(mainObj, null, 2)}</pre>
      <pre>{JSON.stringify(converted, null, 2)}</pre>
      <p>{converted.accountNumber}</p>
      <p>{converted.test}</p>
      <button
        onClick={e => {
          convertedCallback({
            accountNumber: "123456",
            test: "case",
            bier: "geen heineken"
          });
        }}
      >
        click
      </button>
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
