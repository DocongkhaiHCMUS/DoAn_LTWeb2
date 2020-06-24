import scrapy
import json
import os
import re
import time
import sys
import requests
from scrapy.crawler import CrawlerProcess, CrawlerRunner
from scrapy.utils.project import get_project_settings
from scrapy.utils.log import configure_logging
from urllib import parse as UrlParser
from multiprocessing import Process, Queue
from twisted.internet import reactor
import xlsxwriter


#WorkBook = xlsxwriter.Workbook('database.xlsx')

class DanTri(scrapy.Spider):
    name = 'dantri'
    url = 'https://dantri.com.vn'
    Sheet =''
    num_row = 1
    topic = ''
    def start_requests(self):
        yield scrapy.Request(url=self.url, callback=self.parse)
    def parse(self, res):
        #print('\n\n\n\nRunning........................')
        #print(res)
        url_title = ''
        #titles = res.xpath('//nav[@class="main-nav"]/ul/li')
        titles = res.xpath('//div[@class="mgauto wid1004"]/ul/li')
        for item in range(2, len(titles) - 1):
            print(str(item - 1) +' '+ titles.xpath('a/span/text()')[item].get().strip())
        
        #print('\n\n\n\n************************END************************')
        #articles = res.xpath('//div[@class="col-left-folder-v2"]//article[@class="item-news item-news-common"]')
        topic = int(input('Title : ')) + 2
        self.topic = titles[topic].xpath('a/span/text()').get().strip().title()
        
        self.Sheet = WorkBook.add_worksheet(self.topic)
        self.Sheet.write("A1", "ID")
        self.Sheet.write("B1", "Title")
        self.Sheet.write("C1", "Description")
        self.Sheet.write("D1", "Content")
        self.Sheet.write("E1", "Name-Img")
        self.Sheet.write("F1", "Publish Date")
        self.Sheet.write("G1", "Link-Img")
        self.Sheet.write("H1", "Tag")

        url_title = self.url + ('/') + titles[topic].xpath('a/@href').get().replace('/', '')
        yield scrapy.Request(url=url_title, callback=self.parse_title)
        
        #print('\n\n\n\n************************END************************')
    
    
    
    def parse_title(self, res):
       
        
        #print('\n\n\n\nRunning Parse_title........................')
        #print(res)
        articles = res.xpath('//div[@class="mt3 clearfix eplcheck" or @class="mt3 clearfix" or @data-offset]')
        
        url_article = []
      #   inn = 1
        for item in articles:
          #  print (self.url)
            url = self.url + item.xpath('a/@href').get()
            if url is not None:
                url_article.append(url)
                # inn = inn + 1
                # if(inn == 5):
                #     break
        for url in url_article:
            yield scrapy.Request(url=url, callback=self.parse_article)
                
        next_page = self.url  + res.xpath('//div[@class="clearfix mt1"]/div/a/@href').get()
        if next_page is not None:
            
            yield scrapy.Request(url=next_page,callback=self.parse_title)

        
        #print('\n\n\n\n************************END************************')
       


    def parse_article(self, res):
        #print('\n\n\n\nRunning Parse_Article........................')
        #print(res)
          
        
        title = res.xpath('//h1[@class="fon31 mgb15"]/text()').get()
        pub_date = res.xpath('//span[@class = "fr fon7 mr2 tt-capitalize"]/text()').get()
       # description = res.xpath('//h2/child::text()').get()  #Co the a o sau
        description = res.xpath('//h2/text()[2]').get() if not None else res.xpath('//h2/child::text()').get()
        img_link = res.xpath('//img/@data-original').get() if not None else "no_link"
        content = ''
        content_ = res.xpath('//div[@class = "fon34 mt3 mr2 fon43 detail-content"]/p/text()').getall()
        tag = ''
        tag_ = res.xpath('//span[@class="news-tags-item"]/a/text()').getall()

        for item in content_:
            content = content + item.strip()

        for itemm in tag_ :
            tag = tag + itemm.strip() + ('; ')
        
        dir_path = "Images/{}".format(self.topic)
        if not os.path.exists(dir_path):
            os.makedirs(dir_path)
        
       
        img_name = '{}_img_{}'.format(self.topic.replace(' ','').lower(),self.num_row) if img_link is not None  else "no_image"
        if img_link is not None:
            img_data = requests.get(img_link).content
            with open('Images/{}/{}.jpg'.format(self.topic,img_name), 'wb') as handler:
                handler.write(img_data)

        # print(title ,end='\n\n')
        # print(pub_date, end='\n\n')
        # print(description, end='\n\n')
        # print(img_link, end='\n\n')
        # print(content, end='\n\n')

       
        self.Sheet.write(self.num_row, 0, self.num_row)
        self.Sheet.write(self.num_row, 1, title)
        self.Sheet.write(self.num_row, 2, description)
        self.Sheet.write(self.num_row, 3, content)
        self.Sheet.write(self.num_row, 4, img_name)
        self.Sheet.write(self.num_row, 5, pub_date)
        self.Sheet.write(self.num_row, 6, img_link)
        self.Sheet.write(self.num_row, 7, tag)

        print("Write Article {} : -> DONE".format(self.num_row),end='\n\n')
        self.num_row += 1
        
        #print('\n\n\n\n************************END************************')


def sleep(_, duration=5):
    print(f'sleeping for: {duration}')
    time.sleep(duration)  # block here


def crawl(runner):
    d = runner.crawl(DanTri)
    d.addBoth(sleep)
    d.addBoth(lambda _: crawl(runner))
    return d


def Run():
    runner = CrawlerRunner(get_project_settings())
    crawl(runner)
    reactor.run()

WorkBook = xlsxwriter.Workbook(input('Name Database: ') + '.xlsx')

if __name__ == "__main__":
    # process = CrawlerProcess()
    # process.crawl(VnExpress)
    # process.start()
    Run()
    WorkBook.close()
