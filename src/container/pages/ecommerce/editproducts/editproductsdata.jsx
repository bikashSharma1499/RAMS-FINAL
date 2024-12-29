import  { Component } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import Quill styles

export const Editoption1=[
{value:"Category" , label:"Category"},
{value:"Clothing" , label:"Clothing"},
{value:"Footwear" , label:"Footwear"},
{value:"Accesories" , label:"Accesories"},
{value:"Grooming" , label:"Grooming"},
{value:"Watches" , label:"Watches"},
{value:"Ethnic & Festive" , label:"Ethnic & Festive"},
{value:"Jewellery" , label:"Jewellery"},
{value:"Toys & Babycare" , label:"Toys & Babycare"},
{value:"Festive Gifts" , label:"Festive Gifts"},
{value:"Kitchen" , label:"Kitchen"},
{value:"Dining" , label:"Dining"},
{value:"Home Decors" , label:"Home Decors"},
{value:"Stationery" , label:"Stationery"}
];

export const Editoption2=[
{value:"Select", label:"Select"},
{value:"All", label:"All"},
{value:"Male", label:"Male"},
{value:"Female", label:"Female"},
{value:"Others", label:"Others"}
];
export const Editoption3=[
{ value:"" ,label:"Select"},
{value:"Extra Small" ,label:"Extra Small"},
{value:"Small" ,label:"Small"},
{value:"Medium" ,label:"Medium"},
{value:"Large" ,label:"Large"},
{value:"Extra Large" ,label:"Extra Large"},
];
export const Editoption4=[
{value:"" ,label:"Select"},
{value:"Armani" ,label:"Armani"},
{value:"Lacoste" ,label:"Lacoste"},
{value:"Puma" ,label:"Puma"},
{value:"Spykar" ,label:"Spykar"},
{value:"Mufti" ,label:"Mufti"},
{value:"Home Town" ,label:"Home Town"},
{value:"Arrabi" ,label:"Arrabi"}
];

 export const Editoption5=[
{value:"White" , label:"White"},
 {value:"Black" , label:"Black"},
 {value:"Red" , label:"Red"},
 {value:"Orange" , label:"Orange"},
 {value:"Yellow" , label:"Yellow"},
 {value:"Green" , label:"Green"},
 {value:"Blue" , label:"Blue"},
 {value:"Pink" , label:"Pink"},
 {value:"Purple" , label:"Purple"},
 ];

 export const Editoption6=[
{value:"Select", label:"Select"},
{value:"Published", label:"Published"},
{value:"Scheduled", label:"Scheduled"}
];
export const Editoption7=[
{value:"Relaxed", label:"Relaxed"},
{value:"Solid", label:"Solid"},
{value:"Washed", label:"Washed"},
{value:"Plain", label:"Plain"}
];
export const Editoption8=[
{value:"Select", label:"Select"},
{value:"In Stock", label:"In Stock"},
{value:"Out Of Stock", label:"Out Of Stock"}
];


const defaultContent = `
<ul>
<li>Care Instructions: Machine Wash</li>
<li>Neckline: The pullover is framed with a Crew Neck</li>
<li>Fit Type: Regular Fit</li>
<li>Long Sleeves: The pullover is designed with Long Sleeves.</li>
<li>Soft Hand feel: The fabric is extremely soft and comfortable, keeping you at ease for hours.</li>
<li>Solid: The pullover is available in solid pattern.</li>
</ul>`;

class Producteditor extends Component {
  static modules = {
    toolbar: [
      [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
      [{ size: [] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' },
      { 'indent': '-1' }, { 'indent': '+1' }],
      ['link', 'image', 'video'],
      ['clean']
    ],
    clipboard: {
      // toggle to add extra line breaks when pasting HTML:
      matchVisual: false,
    }
  };

  static formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image', 'video'
  ];

  constructor(props) {
    super(props);
    this.state = { producteditorHtml: defaultContent, theme: 'snow' };
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(html) {
    this.setState({ producteditorHtml: html });
  }

  handleThemeChange(newTheme) {
    this.setState({ theme: newTheme });
  }

  render() {
    return (
      <div>
        <ReactQuill
          theme={this.state.theme}
          onChange={this.handleChange}
          value={this.state.producteditorHtml}
          modules={Producteditor.modules}
          formats={Producteditor.formats}
          bounds={'.app'}
          placeholder={this.props.placeholder}
        />
      </div>
    );
  }
}

export default Producteditor;
