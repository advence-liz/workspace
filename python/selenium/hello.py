from selenium import webdriver
from selenium.common.exceptions import NoSuchElementException
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait

driver = webdriver.Chrome()  # Get local session of firefox
driver.implicitly_wait(10)
driver.get('https://www.baidu.com/')  # Load page
elem = driver.find_element_by_id("kw")  # Find the query box
elem.send_keys("seleniumhq" + Keys.RETURN)

# browser.close()
