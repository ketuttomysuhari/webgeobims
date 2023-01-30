from PIL import Image
import requests
import streamlit as st
from streamlit_option_menu import option_menu
from streamlit_lottie import st_lottie

st.set_page_config(page_title="My Apps", page_icon=":tada:", layout="wide")


def load_lottieurl(url):
    r = requests.get(url)
    if r.status_code != 200:
        return None
    return r.json()


# ---- Load Assets ----
lottie_coding = load_lottieurl(
    "https://assets6.lottiefiles.com/packages/lf20_8CeqKMzpWz.json")
img_profil = Image.open("images/Tomy.jpeg")
img_profil_1 = Image.open("images/tomyCV.jpg")
img_BIM_AR = Image.open("images/BIM-AR.jpeg")

# ---- Hide Streamlite Style ----
hide_st_style = """
            <style>
            #MainMenu {visibility: hidden;}
            footer {visibility: hidden;}
            header {visibility: hidden;}
            </style>
            """
st.markdown(hide_st_style, unsafe_allow_html=True)

with st.sidebar:
    selected = option_menu(
        menu_title=None,
        options=["Home", "My CV", "My Projects"],
    )

if selected == "Home":
    # ---- Header Section ----
    with st.container():
        image_column, text_column = st.columns((1, 2))
        with image_column:
            st.image(img_profil)
        with text_column:
            st.subheader("Hi, I am Tomy :wave:")
            st.title("Young Researcher and Surveyor from Indonesia")
            st.write("This is my blog profile, I have a strong background in Cultural Heritage Tourism and Building Information Modelling (BIM). I have experience using BIM to create digital models of historical buildings and landmarks, allowing for more accurate preservation and restoration efforts. I am also knowledgeable in using BIM to create virtual tours and interactive experiences, making it easier for tourists to learn about and engage with the site. Additionally, I have experience in planning and management of cultural heritage tourism by providing detailed information on the capacity and logistics of the site. Overall, I have a deep understanding of how BIM can play a key role in protecting and promoting cultural heritage while providing an enhanced experience for tourists.")

    # ---- What I Do ----
    with st.container():
        st.write("---")
        left_column, right_column = st.columns(2)
        with left_column:
            st.header("What I do")
            st.write("##")
            st.write(
                """
                My dissertation focuses on developing dynamic BIM tools to accommodate changes in the use of traditional space based on tourism, while maintaining harmony with traditional legal norms.
                (1) Research and develop dynamic BIM tools, (2) Study the relationship between traditional space use and tourism, (3) Explore ways to maintain harmony between traditional legal norms and modern use of space
                """
            )
            st.write("Explore my project in menu 3D Viewer")
        with right_column:
            st_lottie(lottie_coding, height=300, key="coding")

    # ---- Project ----
    with st.container():
        st.write("---")
        st.header("My Publications")
        st.write("##")
        image_column, text_column = st.columns((1, 2))
        with image_column:
            st.image(img_BIM_AR)
        with text_column:
            st.subheader("BIM-AR for Cultural Heritage: Candi Kidal")
            st.write(
                """
                Candi Kidal is ...
                """
            )
            st.markdown("[See this link](##)")

if selected == "My CV":
    with st.container():
        st.header("My Biodata")
        st.write("##")
        image_column, text_column = st.columns((1, 2))
        with image_column:
            st.image(img_profil_1)
        with text_column:
            st.title("Ir. Ketut Tomy Suhari, S.T., M.T., IPP.")
            st.subheader(
                "Lecturer of Geodesy Engineering, Institut Teknologi Nasional Malang")
            st.write("This is my blog profile, I have a strong background in Cultural Heritage Tourism and Building Information Modelling (BIM). I have experience using BIM to create digital models of historical buildings and landmarks, allowing for more accurate preservation and restoration efforts. I am also knowledgeable in using BIM to create virtual tours and interactive experiences, making it easier for tourists to learn about and engage with the site. Additionally, I have experience in planning and management of cultural heritage tourism by providing detailed information on the capacity and logistics of the site. Overall, I have a deep understanding of how BIM can play a key role in protecting and promoting cultural heritage while providing an enhanced experience for tourists.")
            st.markdown("[See this link](##)")

if selected == "My Projects":
    with st.container():
        st.subheader("Hi, I am Tomy :wave:")
        st.title("Young Researcher and Surveyor from Indonesia")
        st.write("This is my blog profile, I have a strong background in Cultural Heritage Tourism and Building Information Modelling (BIM). I have experience using BIM to create digital models of historical buildings and landmarks, allowing for more accurate preservation and restoration efforts. I am also knowledgeable in using BIM to create virtual tours and interactive experiences, making it easier for tourists to learn about and engage with the site. Additionally, I have experience in planning and management of cultural heritage tourism by providing detailed information on the capacity and logistics of the site. Overall, I have a deep understanding of how BIM can play a key role in protecting and promoting cultural heritage while providing an enhanced experience for tourists.")

    with st.container():
        st.write("---")
        st.header("My Projects")
        st.write("##")
        image_column, text_column = st.columns((1, 2))
        with image_column:
            st.image(img_BIM_AR)
        with text_column:
            st.subheader("BIM-AR for Cultural Heritage: Candi Kidal")
            st.write(
                """
                Candi Kidal is ...
                """
            )
            st.markdown("[See this link](##)")
