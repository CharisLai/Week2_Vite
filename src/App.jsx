import axios from 'axios'
import { useState } from 'react'
import "./assets/style.css"

// API 設定
const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;




function App() {

  // 登入表單狀態
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  })

  // 登入狀態管理
const [isAuth, setIsAuth] = useState(false); // 預設: 未登入

  // 產品資料狀態
  const [products, setProducts] = useState([]);

  // 目前選擇的產品
  const [tempProduct, setTempProduct] = useState();

  // 目前選擇的產品圖片
  const [tempImage, setTempImage] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    //console.log(name, value);
    setFormData((preData) => ({
      ...preData, // 保留原有屬性
      [name]: value, // 更新對應屬性
    }));
    //console.log(name, value);
  };

  // 取得產品列表 API
const getProducts = async() => {
  try{
    const response = await axios.get(`${API_BASE}/api/${API_PATH}/admin/products`);
    console.log(response.data)
    setProducts(response.data.products);
  }
  catch(error){
    console.log(error.response?.data.message);
  }

}



  // Login API
  const onSubmit = async(e) => {
    try{
      e.preventDefault(); // 阻止表單預設提交行為
      const response = await axios.post(`${API_BASE}/admin/signin`, formData);
      //console.log(response.data);
      
      // 登入後程序
      const { token, expired } = response.data;
      // 設定 Cookie
      document.cookie = `hexToken=${token};expires=${new Date(expired)};`;
      // 修改實體建立時所指派的預設配置
      axios.defaults.headers.common['Authorization'] = token;

      setIsAuth(true); // 更新登入狀態為已登入

      getProducts(); // 取得產品列表
    } catch (error) {
      console.log(error.response);
      setIsAuth(false);
    }
  }

  // 登入後確認狀態BTN
  const checkLogin = async() => {
    try{
    // 從 Cookie 取得 Token
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("hexToken="))
      ?.split("=")[1];

      //console.log("目前 Token：", token);
      if (token) {
       axios.defaults.headers.common.Authorization = token;

      const response = await axios.post(`${API_BASE}/api/user/check`);
      console.log("Token 驗證結果：", response.data);
      }
    }
    catch(error){
      console.log(error.response?.data.message);
    }
  };







  return (
    <>
      {!isAuth ? ( 
      <div className="login-wrapper">
      <div className="login-container ">
        <div className="left-panel">
        {/* Login Form */}
        
        <form className="form-floating" onSubmit={(e) => onSubmit(e)}>
          <h2>Login</h2>
        <div className="form-floating mb-3">
          <input 
          type="email" 
          className="form-control" 
          name="username" 
          placeholder="name@example.com" 
          value={formData.username}
          onChange={(e) => handleInputChange(e)}
          required
          />
          <label htmlFor="username">Email address</label>
        </div>
        <div className="form-floating">
          <input 
          type="password" 
          className="form-control" 
          name="password" 
          placeholder="Password" 
          value={formData.password}
          onChange={(e) => handleInputChange(e)}
          required
          />
          <label htmlFor="password">Password</label>
        </div>

        <button type="submit" className="btn btn-primary w-100 mt-4">Confirm</button>
        </form>
      </div>

        <div className="right-panel">
        {/*右側*/} 
      </div>
    </div>
  </div>
  ): ( <div className="container">

  {/* 功能按鈕 */}
<button
  className="btn btn-danger mb-5"
  type="button"
  onClick={() => {checkLogin()}}
>
  確認是否登入
</button>
    
    {/* 產品列表 */}
            <div className="row mt-5">
            <div className="row">
                <div className="col-md-12">
                    <h2>產品列表</h2>
                    <table className="table">
                        <thead>
                            <tr>
                                <th scope="col">產品名稱</th>
                                <th scope="col">原價</th>
                                <th scope="col">售價</th>
                                <th scope="col">是否啟用</th>
                                <th scope="col">查看細節</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                products.map(product => (

                                    <tr key={product.id}>
                                        <th scope="row">{product.title}</th>
                                        <td>{product.origin_price}</td>
                                        <td>{product.price}</td>
                                        <td>{product.is_enabled ? "啟用" : "未啟用"}</td>
                                        <td>
                                            <button type="button" className="btn btn-primary btn-sm"
                                                onClick={() => setTempProduct(product)}>
                                                查看
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            }

                        </tbody>
                    </table>
                </div>
            </div>
            <div className="row">
                <div className="col-md-12">
                    <h2>產品明細</h2>
                    {
                        tempProduct ? (
                            <div className="card">
                                <img src={tempProduct.imageUrl} className="card-img-top" alt="主圖" />
                                <div className="card-body">
                                    <h5 className="card-title">{tempProduct.title}</h5>
                                    <p className="card-text">
                                        商品描述:{tempProduct.description}
                                    </p>
                                    <p className="card-text">
                                        商品內容:{tempProduct.content}
                                    </p>
                                    <div className="text-secondary mb-2">
                                        <del>{tempProduct.origin_price}</del> 元/
                                        {tempProduct.price} 元

                                    </div>
                                    <h5 className="card-title">更多圖片</h5>
                                    <div className="d-flex flex-wrap">
                                        {
                                            tempProduct.imagesUrl.map((imageUrl, index) => (
                                                <img key={index}
                                                    src={imageUrl}
                                                    style={{
                                                        maxHeight: '100px', marginRight: '10px', cursor: 'pointer',
                                                        border: tempImage === imageUrl ? '2px solid blue' : 'none'
                                                    }}

                                                    onClick={() => {
                                                        // 更換主圖
                                                        const newImages = [...tempProduct.imagesUrl];
                                                        newImages[index] = tempProduct.imageUrl;
                                                        setTempProduct({
                                                            ...tempProduct,
                                                            imageUrl: imageUrl,
                                                            imagesUrl: newImages
                                                        });
                                                    }} />
                                            ))
                                        }
                                    </div>
                                </div>
                            </div>
                        ) : ""
                    }
                </div>
            </div>
        </div>


  </div>
)}
    </>
  );
}

export default App
