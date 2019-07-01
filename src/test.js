import { useState, useEffect } from "react";
import {
  getPath,
  replacePathArrayBrackets,
  setPath
} from "../../../core/utils/pathService";

const allEqual = arr =>
  arr.every(v => JSON.stringify(v) === JSON.stringify(arr[0]));

const absorbState = ({ state, list, merge }) => {
  // rewrite return key with value when merge stategy
  const hasMergeStategy = merge !== undefined;

  const paths = list
    .map(item => {
      const pathResult = getPath(state, replacePathArrayBrackets(item));

      if (hasMergeStategy && pathResult) {
        return { [item]: pathResult };
      }
      return pathResult;
    })
    .filter(item => item !== undefined && item !== null);

  if (hasMergeStategy) {
    return merge(paths);
  }
  if (allEqual(paths)) {
    return paths[0];
  }
  return null;
};

const absorb = ({ state, schema }) => {
  const temp = {};
  schema.forEach(entry => {
    setPath(
      temp,
      entry.key,
      absorbState({ state, list: entry.references, merge: entry.merge }),
      false,
      false
    );
  });
  return temp;
};

const reflect = ({ state, schema, aanvraag }) => {
  const cloneAanvraag = JSON.parse(JSON.stringify(aanvraag));
  schema.forEach(entry => {
    entry.references.forEach(reference => {
      setPath(
        cloneAanvraag,
        replacePathArrayBrackets(reference),
        state[entry.key],
        false,
        true
      );
    });
  });
  return cloneAanvraag;
};

const FinalFormConverter = ({
  aanvraag,
  submit,
  ui,
  waardebereik,
  teksten,
  schema,
  render
}) => {
  const formSubmitHandler = formObject => {
    console.log("formSubmitHandler pressed", formObject);
    submit({ formObject: reflect({ state: formObject, schema, aanvraag }) });
  };

  const [formObject, setFormObject] = useState({});
  const [formUi, setFormUi] = useState({});
  const [formWaardebereik, setFormWaardebereik] = useState({});
  const [formTeksten, setFormTeksten] = useState({});

  useEffect(() => {
    setFormObject(absorb({ state: aanvraag, schema }));
  }, [aanvraag]);

  useEffect(() => {
    setFormUi(absorb({ state: ui, schema }));
  }, [ui]);

  useEffect(() => {
    setFormWaardebereik(absorb({ state: waardebereik, schema }));
  }, [waardebereik]);

  useEffect(() => {
    setFormTeksten(absorb({ state: teksten, schema }));
  }, [teksten]);

  return render({
    formObject,
    formUi,
    formWaardebereik,
    formTeksten,
    formSubmitHandler
  });
};

export default FinalFormConverter;
