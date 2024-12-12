import React, {
  useState,
  useRef,
  useEffect,
  createContext,
  useContext,
  useDeferredValue,
} from "react";
import ErrorBoundary, { setAnimation } from "./Functional-Components";
import Darkmode from "/Icons/dark-mode-icon.svg";
import LightMode from "/Icons/light-mode-icon.svg";
import DictionaryBlack from "/Icons/dictionary-black.svg";
import DictionaryWhite from "/Icons/dictionary-white.svg";
import Play from "/Icons/play.svg";
import Pause from "/Icons/pause.svg";
import Search from "/Icons/search.svg";

const WordContext = createContext();

export function App() {
  const [word, setWord] = useState("");

  return (
    <ErrorBoundary>
      <WordContext.Provider value={{ word, setWord }}>
        <div className="container">
          <Header />
          <SearchArea />
          <Contents />
        </div>
      </WordContext.Provider>
    </ErrorBoundary>
  );
}

const SearchArea = React.memo(() => {
  const [input, setInput] = useState("");
  const [hasError, setHasError] = useState(false);
  const { setWord } = useContext(WordContext);

  const handleChange = (e) => {
    if (e.target.value.trim() !== "") {
      setHasError(false);
      setInput(e.target.value);
    } else {
      setHasError(true);
    }
  };

  const handleSubmit = () => {
    if (input.trim() === "") {
      setHasError(true);
      return;
    }
    setWord(input);
  };

  return (
    <section className="search-area">
      <input
        type="text"
        name="word"
        placeholder="Enter a word to know its meaning"
        onChange={handleChange}
        id="word-search"
      />
      {hasError && <p className="error">Please enter a word</p>}
      <button onClick={handleSubmit} className="search-word">
        <img src={Search} alt="Search Icon" />
      </button>
    </section>
  );
});

const Contents = React.memo(() => {
  const { word } = useContext(WordContext);
  const [wordMeaning, setWordMeaning] = useState(null);
  const fetchedWord = useDeferredValue(wordMeaning);
  const [hasError, setHasError] = useState(false);
  const [playAudio, setPlayAudio] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    if (!word) return;

    const controller = new AbortController();

    async function fetchWord(w) {
      try {
        const fetching = await fetch(
          `https://api.dictionaryapi.dev/api/v2/entries/en/${w}`,
          { signal: controller.signal }
        );
        if (!fetching.ok) {
          throw new Error("Couldn't fetch word");
        }

        const data = await fetching.json();
        setWordMeaning(data[0]);
        setHasError(false);
      } catch (err) {
        console.error("Error: ", err.message);
        setHasError(true);
      }
    }

    fetchWord(word);
    return () => controller.abort();
  }, [word]);

  const handleAudioToggle = () => {
    if (audioRef.current) {
      if (playAudio) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }

      setPlayAudio((n) => !n);
    }
  };

  if (hasError) {
    return (
      <p className="error">Unable to fetch word data. Please try again.</p>
    );
  }

  return (
    fetchedWord && (
      <main className="contents">
        <div className="description-head">
          <div className="word-info">
            <h2>{fetchedWord.word}</h2>
            <p className="phonetic">{fetchedWord.phonetic}</p>
          </div>
          <div className="audio-guide">
            {
              <>
                <audio
                  controls
                  src={fetchedWord.phonetics[0].audio}
                  className="audio"
                  ref={audioRef}
                ></audio>
                <button className="control-audio" onClick={handleAudioToggle}>
                  <img
                    src={playAudio ? Play : Pause}
                    alt="toggle audio"
                    className="toggle-audio"
                  />
                </button>
              </>
            }
          </div>
        </div>
        {fetchedWord.meanings.map((meaning, index) => (
          <section className="contents" key={index}>
            <div className="speech">
              <p>{meaning.partOfSpeech}</p>
              <hr />
            </div>
            <div className="meaning">
              <h4>Meaning</h4>
              <ul className="meaning-list">
                {meaning.definitions.map((def, idx) => (
                  <li key={idx}>
                    <p>{def.definition}</p>
                  </li>
                ))}
              </ul>
              {meaning.definitions.map(
                (def, idx) =>
                  def.example && (
                    <p className="example" key={idx}>
                      {def.example}
                    </p>
                  )
              )}
              <div className="synonyms">
                <h4>Synonyms</h4>
                <p className="synonym">
                  {meaning.synonyms[0] || "No Synonyms Available"}
                </p>
              </div>
            </div>
          </section>
        ))}
        <div className="source">
          <h4>Source</h4>
          <a href={fetchedWord.sourceUrls[0]} className="link">
            {fetchedWord.sourceUrls[0]}
          </a>
        </div>
      </main>
    )
  );
});

const Header = React.memo(() => {
  const [theme, setTheme] = useState("light");
  const [font, setFont] = useState("serif");
  const slider = useRef(null);
  const sliderButton = useRef(null);

  useEffect(() => {
    document.body.style.fontFamily = font;
  }, [font]);

  useEffect(() => {
    document.body.setAttribute("class", theme);
    if (slider.current && sliderButton.current)
      setAnimation(slider.current, sliderButton.current);
  }, [theme]);

  function handleChange() {
    setTheme((n) => (n === "dark" ? "light" : "dark"));
  }

  return (
    <header>
      <div className="image">
        <img
          src={theme === "light" ? DictionaryBlack : DictionaryWhite}
          alt="Dictionary Logo"
          className="logo"
        />
      </div>
      <div className="features">
        <div className="arrow">
          <select
            name="fonts"
            id="fonts"
            onChange={(e) => setFont(e.target.value)}
          >
            <option value="serif">Serif</option>
            <option value="Trebuchet MS">Trebuchet Ms</option>
            <option value="sans-serif">Sans-Serif</option>
          </select>
        </div>
        <hr className="head-hr" />
        <label
          className="slider"
          htmlFor="theme-toggle"
          style={{
            backgroundColor:
              theme === "light" ? "rgb(61, 61, 61)" : "hsl(288, 100%, 36%)",
          }}
          ref={slider}
        >
          <input
            type="checkbox"
            name="theme-toggle"
            id="theme-toggle"
            onChange={handleChange}
          />
          <span className="slider-button" ref={sliderButton}></span>
        </label>
        <img
          src={theme === "light" ? Darkmode : LightMode}
          alt="Current Theme Icon"
          className="theme-image"
        />
      </div>
    </header>
  );
});
