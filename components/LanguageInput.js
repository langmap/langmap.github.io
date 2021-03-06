import React from 'react';
import Map from './Map.js';
import axios from 'axios';
import AnimatedNumber from "animated-number-react";

import AsyncSelect from 'react-select/async';
import { convert, deconvert } from './urlConverter.js';

import Router from 'next/router';
import {Modal, Button, InputGroup, FormControl} from 'react-bootstrap';

import { useCookies } from 'react-cookie';
import { withCookies, Cookies } from 'react-cookie';

import {LanguageOptions} from './languageOptions';

const api_url = 'https://langmap-api.herokuapp.com/';

class LanguageInput extends React.Component {

  constructor (props) {
    super(props);

    var tagObjects = [];
    if(this.props.code){
      var tagList = deconvert(this.props.code);
      for(var i = 0; i < tagList.length; i++) {
          var name = '';
          if (tagList[i] === 'serbocroatian' || tagList[i] === 'serbo-croatian') {
            name = 'Serbo-Croatian (Srpskohrvatski)';
            tagObjects.push({value: tagList[i].charAt(0).toUpperCase() + tagList[i].slice(1), label: 'Serbo-Croatian (Srpskohrvatski)' });
          }
          else {
            name = tagList[i].charAt(0).toUpperCase() + tagList[i].slice(1) + ' (' + this.localizeName(tagList[i]) + ')';
            tagObjects.push({value: tagList[i].charAt(0).toUpperCase() + tagList[i].slice(1), label: name });
          }
      }
    }
      if (tagObjects.length > 1) {
        this.multipleLanguageQueries(tagObjects).then((langData) => {
          this.setState({ langData });
          let sum = 0;
          for(var i = 0; i < tagObjects.length; i++){
              sum += langData[tagObjects[i].value][Object.keys(langData[tagObjects[i].value])[0]].reduce((a, b) => a + (b['val'] || 0), 0);
          }
          this.setState({ value : sum});
        });
      } else if (tagObjects.length === 1) {
       this.getLangData(tagObjects[0].value).then((langData) => {
          this.setState({ langData });
          this.setState({ value : langData[tagObjects[0].value].reduce((a, b) => a + (b['val'] || 0), 0)});
        });
      }

    const { cookies } = this.props;

    this.state = {
      tags: tagObjects,
      langData: [],
      value: 0,
      emailEntered: (cookies.email === 'true'),
      email: '',
      inputValue: ''
    };

    this.getLangData = this.getLangData.bind(this);
    this.multipleLanguageQueries = this.multipleLanguageQueries.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.promiseOptions = this.promiseOptions.bind(this);
    this.filterLanguages = this.filterLanguages.bind(this);
    this.formatValue = this.formatValue.bind(this);
    this.localizeName = this.localizeName.bind(this);
    this.handleEmail = this.handleEmail.bind(this);
    this.onChange  = this.onChange.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  async getLangData(language) {
    const response = await axios.get(api_url + 'search/' + language.toLowerCase());
    return response.data;
  }

  async multipleLanguageQueries(languages) {
    let langData = {};
    for(var i = 0; i < languages.length; i++){
      const value = await this.getLangData(languages[i].value);
      langData[languages[i].value] = value;
    }
    return langData;
  }

  handleChange(tags) {
    if (tags === null){
      this.setState({ tags : [], langData : [], value : 0 });
      return;
    } 
    this.setState({ tags });
    if (tags.length > 1) {
      this.multipleLanguageQueries(tags).then((langData) => {
        this.setState({ langData });
        let sum = 0;
        for(var i = 0; i < tags.length; i++){
            sum += langData[tags[i].value][Object.keys(langData[tags[i].value])[0]].reduce((a, b) => a + (b['val'] || 0), 0);
        }
        this.setState({ value : sum});
      });
    } else if (tags.length === 1) {
     this.getLangData(tags[0].value).then((langData) => {
        this.setState({ langData });
        this.setState({ value : langData[tags[0].value].reduce((a, b) => a + (b['val'] || 0), 0)});
      });
    }
    history.pushState(null, null, '/l/' + convert(tags.map(a => a.value)));
  }

  //async promiseOptions(inputValue) {
    // const response = await axios.get(api_url + 'languages');
    // let options = [];
    // for(var i = 0; i < response.data.length; i++) {
    //   var name = '';
    //   if (response.data[i][0] === 'serbocroatian' || response.data[i][0] === 'serbo-croatian') {
    //     name = 'Serbo-Croatian (Srpskohrvatski)';
    //     options.push({value: response.data[i][0].charAt(0).toUpperCase() + response.data[i][0].slice(1), label: 'Serbo-Croatian (Srpskohrvatski)' });
    //   }
    //   else {
    //     name = response.data[i][0].charAt(0).toUpperCase() + response.data[i][0].slice(1) + ' (' + this.localizeName(response.data[i][0]) + ')';
    //     options.push({value: response.data[i][0].charAt(0).toUpperCase() + response.data[i][0].slice(1), label: name });
    //   }
    // }
  //   console.log(JSON.stringify(options));
  //   return options;
  // }

    filterLanguages(inputValue) {
      return LanguageOptions.filter(i =>
        i.label.toLowerCase().startsWith(inputValue.toLowerCase())
      );
    };

    promiseOptions(inputValue){
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(this.filterLanguages(inputValue));
        }, 100);
      });
    }


  localizeName(name){
    const names = {
        'afrikaans': 'Afrikaans', 
        'akan': 'Akan',
        'albanian': 'Shqipëri', 
        'amharic': 'አማርኛ', 
        'armenian': 'հայերեն', 
        'assyrian': 'ܣܘܪܝܬ',
        'belarusian' : 'беларуская мова',
        'bulgarian': 'български език',
        'azerbaijani': 'Azərbaycan dili', 
        'cantonese': '廣東話', 
        'catalan' : 'Català',
        'czech': 'Čeština', 
        'danish': 'Dansk', 
        'dutch': 'Nederlands', 
        'estonian': 'Eesti keel', 
        'persian': 'فارسی', 
        'finnish': 'Suomen kieli', 
        'french': 'Français', 
        'fula': 'Fulfulde',
        'galician': 'Galego',
        'georgian' : 'ქართული',
        'greek': 'Ελληνικά', 
        'guarani': 'Avañeʼẽ',
        'gujarati': 'ગુજરાતી', 
        'hausa': 'Harshen Hausa', 
        'hebrew': 'עברית', 
        'hindi': 'हिंदी', 
        'hmong': 'lus Hmoob',
        'hungarian': 'Magyar nyelv', 
        'icelandic': 'Íslenska', 
        'igbo': 'Asụsụ Igbo', 
        'indonesian': 'Bahasa Indonesia', 
        'italian': 'Italiano', 
        'javanese': 'ꦧꦱꦗꦮ', 
        'kazahk': 'Қазақша', 
        'kurdish': 'Kurdî‎',
        'kyrgyz': 'Кыргызча',
        'khmer': 'ភាសាខ្មែរ', 
        'korean': '한국어', 
        'latvian': 'Latviešu valoda', 
        'lithuanian': 'Lietuvių kalba', 
        'marathi': 'मराठी', 
        'maltese' : 'Malti',
        'hokkien': '閩南語', 
        'mongolian': 'монгол хэл', 
        'nepali': 'नेपाली', 
        'norwegian': 'Norsk', 
        'odia': 'ଓଡ଼ିଆ', 
        'oromo': 'Afaan Oromoo',
        'pashto': 'پښتو',
        'punjabi': 'ਪੰਜਾਬੀ', 
        'quechua': 'Kechua',
        'romanian': 'Limba română', 
        'serbocroatian': 'Srpskohrvatski', 
        'sindhi': 'سنڌي‎',
        'sinhala': 'සිංහල',
        'spanish' : 'Español',
        'shona': 'chiShona', 
        'slovene': 'Slovenščina', 
        'somali': 'Af Soomaali', 
        'swedish': 'Svenska', 
        'tamil': 'தமிழ்', 
        'tatar': 'татар теле',
        'telugu': 'తెలుగు', 
        'thai': 'ภาษาไทย', 
        'tibetan': 'བོད་སྐད་', 
        'tigrigna': 'ትግርኛ‎',
        'turkish': 'Türkçe', 
        'turkmen': 'Türkmençe',
        'ukrainian': 'українська мова', 
        'urdu': 'اُردُو', 
        'uzbek': 'O‘zbekcha', 
        'vietnamese': 'Tiếng Việt', 
        'welsh': 'Cymraeg',
        'wolof': 'Wolof',
        'wu': '吳語', 
        'xhosa': 'isiXhosa', 
        'yiddish': 'ייִדיש', 
        'yoruba': 'Èdè Yorùbá', 
        'zulu': 'isiZulu',
        'hakka' : '客家話',
        'kannada' : 'ಕನ್ನಡ',
        'lao' : 'ພາສາລາວ',
        'lingala' : 'Lingála',
        'malay' : 'Bahasa Melayu',
        'malayam' : 'മലയാളം',
        'macedonian' : 'македонски',
        'slovak' : 'Slovenčina',
        'swahili' : 'Kiswahili',
        'german' : 'Deutsch',
        'arabic' : 'اَلْعَرَبِيَّةُ‎',
        'bengali' : 'বাংলা',
        'english' : 'English',
        'mandarin' : '中文',
        'japanese' : '日本語',
        'tagalog' : 'Tagalog',
        'russian' : 'Русский',
        'portuguese' : 'Português',
        'polish' : 'Język polski',
        'haitian' : 'Kreyòl ayisyen'
    }
     return names[name];
  }

  formatValue(value) {
    return "You can speak with " + value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " people!";
  }

  async handleEmail() {
    const response = await axios.get(api_url + 'new/' + this.state.email);
    this.setState({emailEntered: true});
    const { cookies } = this.props;
    cookies.set('email', true, { path: '/', sameSite: 'none', secure: true });
    return; 
  }

  onChange(value){
      var name = '';
      var newVal = {};
      if (value === 'serbocroatian' || value === 'serbo-croatian') {
        name = 'Serbo-Croatian (Srpskohrvatski)';
        newVal = {value: value.charAt(0).toUpperCase() + value.slice(1), label: 'Serbo-Croatian (Srpskohrvatski)' };
      }
      else {
        name = value.charAt(0).toUpperCase() + value.slice(1) + ' (' + this.localizeName(value) + ')';
        newVal = {value: value.charAt(0).toUpperCase() + value.slice(1), label: name };
      }
    let newTags = this.state.tags.push(newVal);
    this.handleChange(newTags);
  }

  handleInputChange(newValue){
    const inputValue = newValue.replace(/\W/g, '');
    this.setState({ inputValue });
    return inputValue;
  }

  render () {
    const { cookies } = this.props;
    return(
      <div id="outer-input">
        <div style={{'marginTop' : '5px', 'marginBottom' : '5px'}}>
        { this.state.value > 0 && 
          <h1 align="center"> <AnimatedNumber value={this.state.value} formatValue={this.formatValue} duration="300"/> </h1>
        }
        <AsyncSelect value={this.state.tags} onInputChange={this.handleInputChange} cacheOptions placeholder={'Select some languages...'} onSelectResetsInput={false} onBlurResetsInput={false} defaultOptions loadOptions={this.promiseOptions} onChange={this.handleChange} isMulti />
        </div>
        {(this.state.emailEntered || this.state.value === 0) && 
          <div>
            <Map langData={this.state.langData} number={this.state.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}/>
          </div>
        }
        {(!this.state.emailEntered && this.state.value !== 0) &&
          <div>
              <Modal
              show={!this.state.emailEntered}
            onHide={() => {this.setState({emailEntered: true})}}
            backdrop="static"
            keyboard={false}
            centered
          >
            <Modal.Header closeButton>
              <Modal.Title>Get Exclusive LangMap Updates</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              Sign up for updates on LangMap, language learning information and more! 
            </Modal.Body>
            <InputGroup style={{width: '80%', marginRight: 'auto', marginLeft: 'auto', paddingBottom: '20px'}}>
              <FormControl placeholder={'email@example.com'} type="email" onChange={(e) => {this.setState({email : e.target.value})}} />
              <InputGroup.Append>
                <Button variant="primary" onClick={() => {this.handleEmail()}}>Submit</Button> 
              </InputGroup.Append>
            </InputGroup>
          </Modal>
          <div style={{ msFilter: 'blur(5px)', filter: 'blur(5px)'}}>
            <Map langData={this.state.langData} number={this.state.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}/>
          </div>
          </div>
        }
      </div>
    )
  }
}
 
export default withCookies(LanguageInput); 